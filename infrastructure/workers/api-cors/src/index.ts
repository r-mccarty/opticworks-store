/**
 * Cloudflare Worker - CORS Proxy for Medusa API
 *
 * This worker sits in front of the Medusa backend to handle CORS preflight
 * requests (OPTIONS) that browsers send without custom headers.
 *
 * Flow:
 * 1. Browser sends OPTIONS request to api.optic.works
 * 2. This worker responds with CORS headers (200 OK)
 * 3. Browser sends actual request with x-publishable-api-key header
 * 4. This worker proxies to medusa.optic.works (Cloudflare Tunnel)
 * 5. Response is returned with CORS headers added
 */

interface Env {
  MEDUSA_ORIGIN: string;
  ALLOWED_ORIGINS: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-publishable-api-key, x-medusa-access-token",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400",
};

function getAllowedOrigins(env: Env): string[] {
  return env.ALLOWED_ORIGINS.split(",").map(o => o.trim());
}

function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false;
  return allowedOrigins.includes(origin);
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    ...CORS_HEADERS,
    "Access-Control-Allow-Origin": origin,
  };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const origin = request.headers.get("Origin");
    const allowedOrigins = getAllowedOrigins(env);

    // Check if origin is allowed
    if (!isOriginAllowed(origin, allowedOrigins)) {
      // For requests without Origin header (e.g., same-origin, server-to-server),
      // proxy directly without CORS headers
      if (!origin) {
        return proxyRequest(request, env);
      }
      // Reject disallowed origins
      return new Response("Origin not allowed", { status: 403 });
    }

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin!),
      });
    }

    // Proxy the actual request to Medusa
    const response = await proxyRequest(request, env);

    // Add CORS headers to the response
    const newHeaders = new Headers(response.headers);
    for (const [key, value] of Object.entries(corsHeaders(origin!))) {
      newHeaders.set(key, value);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};

async function proxyRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  // Construct the Medusa backend URL
  const medusaUrl = new URL(env.MEDUSA_ORIGIN);
  medusaUrl.pathname = url.pathname;
  medusaUrl.search = url.search;

  // Clone headers and forward to Medusa
  const headers = new Headers(request.headers);

  // Remove hop-by-hop headers
  headers.delete("host");

  // Set the correct host for the backend
  headers.set("Host", medusaUrl.host);

  // Forward the request to Medusa
  const proxyRequest = new Request(medusaUrl.toString(), {
    method: request.method,
    headers: headers,
    body: request.body,
    redirect: "manual",
  });

  return fetch(proxyRequest);
}
