import { puter } from "@heyputer/puter.js";

import {
  getOrCreateHostingConfig,
  uploadImageToHosting,
} from "./puter.hosting";
import { isHostedUrl } from "./utils";
import { PUTER_WORKER_URL } from "./constants";

console.log("WORKER URL:", import.meta.env.VITE_PUTER_WORKER_URL);
/* =========================
   AUTH
========================= */
export const signIn = async () => await puter.auth.signIn();
export const signOut = async () => puter.auth.signOut();

export const getCurrentUser = async () => {
  try {
    return await puter.auth.getUser();
  } catch {
    return null;
  }
};

/* =========================
   CREATE PROJECT
========================= */
export const createProject = async ({
  item,
  visibility = "private",
}: CreateProjectParams): Promise<DesignItem | null> => {
  if (!PUTER_WORKER_URL) {
    console.warn("Missing VITE_PUTER_WORKER_URL");
    return null;
  }

  try {
    const user = await puter.auth.getUser();
    console.log("Auth user:", user);
    if (!user) {
      await puter.auth.signIn();
    }

    const projectId = item.id;
    const hosting = await getOrCreateHostingConfig();

    if (!hosting) {
      console.error("Hosting not available");
      return null;
    }

    const hostedSource = await uploadImageToHosting({
      hosting,
      url: item.sourceImage,
      projectId,
      label: "source",
    });

    const hostedRender =
      projectId && item.renderedImage
        ? await uploadImageToHosting({
            hosting,
            url: item.renderedImage,
            projectId,
            label: "rendered",
          })
        : null;

    const resolvedSource =
      hostedSource?.url ||
      (isHostedUrl(item.sourceImage) ? item.sourceImage : "");

    if (!resolvedSource) {
      console.warn("Failed to host source image");
      return null;
    }

    const resolvedRender = hostedRender?.url
      ? hostedRender.url
      : item.renderedImage && isHostedUrl(item.renderedImage)
      ? item.renderedImage
      : undefined;

    const {
      sourcePath: _sourcePath,
      renderedPath: _renderedPath,
      publicPath: _publicPath,
      ...rest
    } = item;

    const payload = {
      ...rest,
      sourceImage: resolvedSource,
      renderedImage: resolvedRender,
    };

   const response = await puter.workers.exec(
  `${PUTER_WORKER_URL}/api/projects/save`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project: payload, visibility }),
  }
);

// ✅ Read body ONCE
const text = await response.text();
console.log("Save response status:", response.status);
console.log("Save response body:", text);

if (!response.ok) {
  console.error("Failed to save project:", text);
  return null;
}

// ✅ Parse from the already-read text, not response.json()
const data = JSON.parse(text) as { project?: DesignItem | null };

return data?.project ?? null;
  } catch (error) {
    console.error("Create project failed:", error);
    return null;
  }
};

export const debugKv = async () => {
  const response = await puter.workers.exec(
    `${PUTER_WORKER_URL}/api/debug/kv`,
    { method: "GET" }
  );
  const text = await response.text();
  console.log("KV Debug:", text);
};
/* =========================
   GET ALL PROJECTS
========================= */
export const getProjects = async (): Promise<DesignItem[]> => {
  console.log("getProjects called"); // 👈 add this
  console.log("WORKER URL in getProjects:", PUTER_WORKER_URL);
  if (!PUTER_WORKER_URL) {
    console.warn("Missing VITE_PUTER_WORKER_URL");
    return [];
  }

  try {
    const user = await puter.auth.getUser();
    if (!user) {
      await puter.auth.signIn();
    }

    const response = await puter.workers.exec(
      `${PUTER_WORKER_URL}/api/projects/list`,
      { method: "GET" }
    );

    const text = await response.text();
    console.log("List response status:", response.status);
    console.log("List response body:", text);

    if (!response.ok) {
      console.error("Failed to fetch projects:", text);
      return [];
    }

    const data = JSON.parse(text) as { projects?: DesignItem[] | null };
    return Array.isArray(data?.projects)
      ? data.projects.filter((p): p is DesignItem => p !== null && typeof p === "object" && "id" in p)
      : [];
  } catch (error) {
    console.error("Failed to get projects:", error);
    return [];
  }
};

/* =========================
   GET PROJECT BY ID
========================= */
export const getProjectById = async ({
  id,
}: {
  id: string;
}): Promise<DesignItem | null> => {
  if (!PUTER_WORKER_URL) {
    console.warn("Missing VITE_PUTER_WORKER_URL");
    return null;
  }

  try {
    const user = await puter.auth.getUser();
    if (!user) {
      await puter.auth.signIn();
    }

    const response = await puter.workers.exec(
      `${PUTER_WORKER_URL}/api/projects/get?id=${encodeURIComponent(id)}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch project:", await response.text());
      return null;
    }

    const data = (await response.json()) as {
      project?: DesignItem | null;
    };

    return data?.project ?? null;
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return null;
  }
};