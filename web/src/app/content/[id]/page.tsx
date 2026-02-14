"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getToken } from "@/lib/token";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

type ContentView = {
  id: number;
  contentType: string;
  region: string;
  category: string;
  tags: string[];
  priority: string;
  status: string;
  publishedAt: string;
  selectedLanguage: string;
  availableLanguages: string[];
  title: string;
  bodyHtml: string;
  createdBy: string;
  createdAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
  version: number;
  internal: boolean;
};

export default function ContentPage() {
  const params = useParams<{ id: string }>();
  const sp = useSearchParams();
  const initialLang = sp.get("lang") || "en";

  const [lang, setLang] = useState(initialLang);
  const [data, setData] = useState<ContentView | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const token = await getToken();
        const res = await apiFetch(`/api/v1/content/${params.id}/view?lang=${lang}`, token);
        setData(res);
      } catch (e: any) {
        setErr(e.message);
      }
    })();
  }, [params.id, lang]);

  if (err) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="panel" style={{ maxWidth: "520px", textAlign: "center" }}>
          <h2 style={{ marginBottom: "0.75rem", color: "var(--danger)" }}>Unable to load content</h2>
          <p className="subtle" style={{ marginBottom: "1.25rem" }}>{err}</p>
          <Link href="/" className="btn btn-primary">Return to published</Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p className="subtle">Loading content...</p>
      </div>
    );
  }

  return (
    <div>
      <header className="topbar">
        <div className="brand">
          <div className="logo">RB</div>
          <div>
            <h1>Content detail</h1>
            <p className="subtle">RB Bank content view</p>
          </div>
        </div>
        <nav className="nav">
          <Link href="/">Published</Link>
          <Link href="/drafts">Drafts</Link>
          <Link href="/approvals">Approvals</Link>
        </nav>
      </header>

      <main className="app-shell">
        <section className="panel" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <h2 className="panel-title">{data.title}</h2>
              <p className="subtle">
                {data.region} | {data.category} | {data.contentType}
              </p>
            </div>
            <div className="field" style={{ minWidth: "160px" }}>
              <label>Language</label>
              <select value={lang} onChange={(e) => setLang(e.target.value)}>
                {data.availableLanguages.map((l) => (
                  <option key={l} value={l}>
                    {l.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
            <span className="pill accent">{data.status}</span>
            <span className="pill">{data.priority}</span>
            <span className="pill">v{data.version}</span>
            {data.internal && <span className="pill">Internal</span>}
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
            <span className="subtle">Published: {new Date(data.publishedAt).toLocaleString()}</span>
            <span className="subtle">Created by {data.createdBy}</span>
            {data.approvedBy && <span className="subtle">Approved by {data.approvedBy}</span>}
          </div>

          {data.tags.length > 0 && (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
              {data.tags.map((tag) => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>
          )}
        </section>

        <article className="panel" style={{ fontSize: "1.05rem", lineHeight: 1.8 }}>
          <div dangerouslySetInnerHTML={{ __html: data.bodyHtml }} />
        </article>
      </main>
    </div>
  );
}
