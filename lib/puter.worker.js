function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function jsonError(status, message, extra = {}) {
  return new Response(
    JSON.stringify({ error: message, ...extra }),
    {
      status: Number(status) || 500,
      headers: { "Content-Type": "application/json" },
    }
  );
}

const PROJECT_PREFIX = "roomify_project:";

const getUserId = async (userPuter) => {
  try {
    const user = await userPuter.auth.getUser();
    return user?.uuid || null;
  } catch {
    return null;
  }
};

router.post("/api/projects/save", async ({ request, user }) => {
  try {
    const userPuter = user?.puter;
    if (!userPuter) return jsonError(401, "Authentication failed");

    const body = await request.json();
    const project = body?.project;

    if (!project?.id || !project?.sourceImage) {
      return jsonError(400, "Project ID and source image are required");
    }

    const payload = { ...project, updatedAt: new Date().toISOString() };

    const userId = await getUserId(userPuter);
    if (!userId) return jsonError(401, "Authentication failed");

    const key = `${PROJECT_PREFIX}${project.id}`;
    await userPuter.kv.set(key, payload);

    return json({ saved: true, id: project.id, project: payload });
  } catch (e) {
    return jsonError(500, "Failed to save project", { message: e.message || "Unknown error" });
  }
});

router.get("/api/projects/list", async ({ user }) => {
  try {
    const userPuter = user?.puter;
    if (!userPuter) return jsonError(401, "Unauthorized");

    const keys = await userPuter.kv.list();

    const projectKeys = keys.filter(
      (key) => typeof key === "string" && key.startsWith(PROJECT_PREFIX)
    );

    const projects = await Promise.all(
      projectKeys.map((key) => userPuter.kv.get(key))
    );

    return json({
      projects: projects.filter(
        (p) => p !== null && p !== undefined && typeof p === "object"
      ),
    });
  } catch (error) {
    return jsonError(500, "Failed to list projects", { debug: error?.message || "unknown" });
  }
});

router.get("/api/projects/get", async ({ request, user }) => {
  try {
    const userPuter = user?.puter;
    if (!userPuter) return jsonError(401, "Authentication failed");

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return jsonError(400, "Project ID is required");

    const key = `${PROJECT_PREFIX}${id}`;
    const project = await userPuter.kv.get(key);
    if (!project) return jsonError(404, "Project not found");

    return json({ project });
  } catch (e) {
    return jsonError(500, "Failed to get project", { message: e.message || "Unknown error" });
  }
});

router.get("/api/debug/kv", async ({ user }) => {
  try {
    const userPuter = user?.puter;
    if (!userPuter) return jsonError(401, "Unauthorized");

    const keys = await userPuter.kv.list();
    return json({ count: keys.length, keys });
  } catch (error) {
    return jsonError(500, "KV debug failed", { debug: error?.message });
  }
});

router.get("/", () => json({ status: "ok", message: "Roomify API is running" }));
router.get("/api/hello", () => json({ msg: "hello" }));
router.get("/*page", ({ params }) => new Response(`Page ${params.page} not found`, { status: 404 }));