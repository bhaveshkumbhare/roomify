import { puter, type Hosting } from "@heyputer/puter.js";
import {
  createHostingSlug,
  fetchBlobFromUrl,
  getHostedUrl,
  getImageExtension,
  HOSTING_CONFIG_KEY,
  imageUrlToPngBlob,
  isHostedUrl,
} from "./utils";

/* ================= TYPES ================= */

type HostingConfig = {
  subdomain: string;
};

type StoreHostedImageParams = {
  hosting: HostingConfig | null;
  url: string;
  projectId: string;
  label: "source" | "rendered";
};

type HostedAsset = {
  url: string;
};

/* ================= GET / CREATE HOSTING ================= */

export const getOrCreateHostingConfig = async (): Promise<HostingConfig | null> => {
  const existing = (await puter.kv.get(HOSTING_CONFIG_KEY)) as HostingConfig | null;

  if (existing?.subdomain) {
    return { subdomain: existing.subdomain };
  }

  const subdomain = createHostingSlug();

  try {
    const created = await puter.hosting.create(subdomain, ".");

    const record = { subdomain: created.subdomain };

    // ✅ SAVE TO KV (IMPORTANT)
    await puter.kv.set(HOSTING_CONFIG_KEY, record);

    return record;
  } catch (error) {
    console.warn(`could not create subdomain: ${error}`);
    return null;
  }
};

/* ================= UPLOAD IMAGE ================= */

export const uploadImageToHosting = async ({
  hosting,
  url,
  projectId,
  label,
}: StoreHostedImageParams): Promise<HostedAsset | null> => {
  if (!hosting || !url) return null;

  if (isHostedUrl(url)) return { url };

  try {
    const resolved =
      label === "rendered"
        ? await imageUrlToPngBlob(url).then((blob) =>
            blob ? { blob, contentType: "image/png" } : null
          )
        : await fetchBlobFromUrl(url);

    if (!resolved) return null;

    const contentType = resolved.contentType || resolved.blob.type || "";
    const ext = getImageExtension(contentType, url);

    const dir = `project/${projectId}`;
    const filePath = `${dir}/${label}.${ext}`;

    const uploadFile = new File([resolved.blob], `${label}.${ext}`, {
      type: contentType,
    });

    // ✅ Ensure directory exists
    await puter.fs.mkdir(dir, { createMissingParents: true });

    // ✅ Write file
    await puter.fs.write(filePath, uploadFile);

    const hostedUrl = getHostedUrl(
      { subdomain: hosting.subdomain },
      filePath
    );

    return hostedUrl ? { url: hostedUrl } : null;
  } catch (error) {
    console.warn(`Failed to store hosted Image: ${error}`);
    return null;
  }
};