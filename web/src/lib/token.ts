const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://content-platform-api-1gk1.onrender.com";
const clientId = "content-platform-client";
const clientSecret = "secret";

function encodeBasicAuth(id: string, secret: string) {
  if (typeof btoa !== "undefined") {
    return btoa(`${id}:${secret}`);
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(`${id}:${secret}`).toString("base64");
  }
  throw new Error("No base64 encoder available in this environment");
}

export async function getToken() {
  const res = await fetch(`${apiBase}/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${encodeBasicAuth(clientId, clientSecret)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "content.read content.write",
    }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to get token");
  const data = await res.json();
  return data.access_token as string;
}
