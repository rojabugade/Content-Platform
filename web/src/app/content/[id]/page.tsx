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

const CONTENT_TYPE_ICONS: Record<string, string> = {
  ARTICLE: "📰",
  POLICY: "📋",
  ANNOUNCEMENT: "📢",
  CAMPAIGN: "🎯",
  GUIDELINE: "📘",
  FAQ: "❓",
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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)" }}>
        <div className="card" style={{ maxWidth: "500px", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ marginBottom: "1rem", color: "var(--danger)" }}>Error Loading Content</h2>
          <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>{err}</p>
          <Link href="/" className="btn btn-primary">
            ← Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
          <p style={{ color: "#64748b" }}>Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      {/* Header */}
      <header
        style={{
          background: "var(--card-bg)",
          borderBottom: "1px solid var(--border)",
          padding: "1rem 2rem",
          boxShadow: "0 1px 3px var(--shadow)",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: "600" }}>
            ← Back to Feed
          </Link>
          
          {/* Language Switcher */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: "600" }}>🗣️ Language:</span>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              {data.availableLanguages.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    padding: "0.375rem 0.75rem",
                    background: l === lang ? "var(--primary)" : "var(--border)",
                    color: l === lang ? "white" : "var(--foreground)",
                    border: "none",
                    borderRadius: "0.375rem",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            {data.availableLanguages.length > 1 && data.selectedLanguage !== lang && (
              <span style={{ fontSize: "0.75rem", color: "#64748b", marginLeft: "0.5rem" }}>
                ✨ Fallback available
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: "1000px", margin: "2rem auto", padding: "0 2rem" }}>
        {/* Metadata Card */}
        <div className="card" style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" }}>
            <span style={{ fontSize: "3rem" }}>{CONTENT_TYPE_ICONS[data.contentType] || "📄"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                <span className="badge" style={{ background: "var(--primary)", color: "white" }}>
                  {data.contentType}
                </span>
                <span className="badge" style={{ background: "var(--success)", color: "white" }}>
                  {data.status}
                </span>
                <span className="badge" style={{ background: "var(--warning)", color: "white" }}>
                  {data.priority}
                </span>
                {data.internal && (
                  <span className="badge" style={{ background: "var(--secondary)", color: "white" }}>
                    🔒 INTERNAL
                  </span>
                )}
                <span className="badge" style={{ background: "var(--border)", color: "var(--foreground)" }}>
                  v{data.version}
                </span>
              </div>

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.875rem", color: "#64748b" }}>
                <span>🌍 {data.region}</span>
                <span>📂 {data.category}</span>
                <span>📅 {new Date(data.publishedAt).toLocaleString()}</span>
                <span>👤 {data.createdBy}</span>
                {data.approvedBy && <span>✅ Approved by {data.approvedBy}</span>}
              </div>

              {data.tags.length > 0 && (
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
                  {data.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: "0.25rem 0.625rem",
                        background: "var(--border)",
                        borderRadius: "0.375rem",
                        fontSize: "0.75rem",
                        color: "var(--foreground)",
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <article
          className="card"
          style={{
            fontSize: "1.125rem",
            lineHeight: "1.8",
          }}
        >
          <h1 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "1.5rem", lineHeight: "1.2" }}>
            {data.title}
          </h1>
          
          <div
            style={{
              borderTop: "2px solid var(--border)",
              paddingTop: "1.5rem",
            }}
            dangerouslySetInnerHTML={{ __html: data.bodyHtml }}
          />
        </article>

        {/* Version History Footer */}
        <div
          className="card"
          style={{
            marginTop: "2rem",
            background: "var(--background)",
            borderStyle: "dashed",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "0.25rem" }}>
                📋 Version History & Audit Trail
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Created by {data.createdBy} on {new Date(data.createdAt).toLocaleString()}
                {data.approvedBy && ` • Approved by ${data.approvedBy} on ${new Date(data.approvedAt!).toLocaleString()}`}
              </div>
            </div>
            <button
              className="btn"
              style={{ background: "var(--border)", color: "var(--foreground)", fontSize: "0.875rem" }}
            >
              📜 View Full History
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
