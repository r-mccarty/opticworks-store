/** Temporary API boundary while the legacy backend is archived. */
export default {
  /** @param {Request} request */
  fetch(request) {
    const origin = request.headers.get("Origin");
    const headers = new Headers({
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "Retry-After": "86400",
      "X-OpticWorks-Backend": "offline",
      "Vary": "Origin",
    });
    if (origin === "https://optic.works" || origin === "https://www.optic.works") {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Access-Control-Allow-Credentials", "true");
      headers.set("Access-Control-Allow-Methods", "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-publishable-api-key, x-medusa-access-token, x-request-id, x-correlation-id");
    }
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }
    const body = request.method === "HEAD" ? null : JSON.stringify({
      code: "BACKEND_OFFLINE",
      message: "This service is currently unavailable.",
    });
    return new Response(body, { status: 503, headers });
  },
};
