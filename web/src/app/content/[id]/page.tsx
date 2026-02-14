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
  coverImage?: string;
};

type DraftEntry = {
  id: number;
  coverImage?: string;
};

const STORAGE_KEY = "rb_drafts";

function loadDrafts(): DraftEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DraftEntry[]) : [];
  } catch {
    return [];
  }
}

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
        
        // Load drafts from localStorage to get cover image
        const drafts = loadDrafts();
        const draft = drafts.find(d => d.id === parseInt(params.id));
        
        // Merge cover image from localStorage
        setData({
          ...res,
          coverImage: res.coverImage || draft?.coverImage
        });
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
          <Link href="/">
            <div className="logo">RB</div>
          </Link>
          <div>
            <h1>RB Bank Content Publisher</h1>
            <p className="subtle">RB is the award-winning content, data, analytics and trading platform for Institutional and Corporate clients.</p>
          </div>
        </div>
        <nav className="nav">
          <Link href="/">Published</Link>
          <Link href="/drafts">Dashboard</Link>
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

        {/* Cover Image */}
        {data.coverImage && (
          <div style={{ marginBottom: "1.5rem", borderRadius: "14px", overflow: "hidden", boxShadow: "0 4px 12px var(--shadow)", aspectRatio: "16 / 6" }}>
            <img src={data.coverImage} alt={data.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        )}

        <article className="panel" style={{ fontSize: "1.05rem", lineHeight: 1.8 }}>
          <div dangerouslySetInnerHTML={{ __html: data.bodyHtml }} />
        </article>
      </main>
    </div>
  );
}
