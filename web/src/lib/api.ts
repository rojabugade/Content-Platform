const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";

export type CreateContentPayload = {
  contentType: string;
  region: string;
  category: string;
  tags: string[];
  priority: string;
  pinned: boolean;
  scheduledPublishAt?: string | null;
  scheduledUnpublishAt?: string | null;
  internal: boolean;
};

export type ContentItemResponse = {
  id: number;
  region: string;
  category: string;
  status: string;
};

export type UpsertVariantPayload = {
  languageCode: string;
  title: string;
  bodyHtml: string;
  isDefaultLang: boolean;
};

export async function apiFetch(path: string, token: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function createContent(token: string, payload: CreateContentPayload) {
  return apiFetch("/api/v1/content", token, {
    method: "POST",
    body: JSON.stringify(payload),
  }) as Promise<ContentItemResponse>;
}

export async function upsertVariant(token: string, id: number, payload: UpsertVariantPayload) {
  return apiFetch(`/api/v1/content/${id}/variants`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function publishContent(token: string, id: number) {
  return apiFetch(`/api/v1/content/${id}/publish`, token, {
    method: "POST",
  });
}
