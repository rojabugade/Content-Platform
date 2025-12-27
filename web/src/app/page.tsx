"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getToken } from "@/lib/token";
import { apiFetch } from "@/lib/api";

type FeedItem = {
  id: number;
  contentType: string;
  region: string;
  category: string;
  tags: string[];
  priority: string;
  pinned: boolean;
  status: string;
  publishedAt: string;
  scheduledUnpublishAt: string | null;
  displayLanguage: string;
  availableLanguages: string[];
  title: string;
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

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#94a3b8",
  NORMAL: "#3b82f6",
  HIGH: "#f59e0b",
  URGENT: "#ef4444",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#94a3b8",
  IN_REVIEW: "#f59e0b",
  APPROVED: "#10b981",
  PUBLISHED: "#3b82f6",
  ARCHIVED: "#64748b",
};

const valuePillars = [
  {
    title: "Multi-region content",
    body: "Organize content by region: US, JP, RU and manage content variants per region.",
  },
  {
    title: "Multi-language support",
    body: "English, Japanese, Russian language variants with automatic fallback.",
  },
  {
    title: "Workflow & approval",
    body: "Draft → Review → Approve → Publish lifecycle with audit trail.",
  },
  {
    title: "Access control",
    body: "Role-based access (Editor, Reviewer, Admin) with region scoping.",
  },
  {
    title: "Version history",
    body: "Track changes, maintain versions, and rollback when needed.",
  },
  {
    title: "Content types",
    body: "Articles, Policies, Announcements, Guidelines, FAQs, and more.",
  },
];

export default function Home() {
  const [region, setRegion] = useState("JP");
  const [lang, setLang] = useState("ja");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        const token = await getToken();
        const data = await apiFetch(`/api/v1/feed?region=${region}&lang=${lang}`, token);
        setItems(data);
      } catch (e: any) {
        setErr(e.message);
      }
    })();
  }, [region, lang]);

  const filteredItems = items
    .filter((item) => filter === "all" || item.contentType === filter)
    .filter((item) =>
      searchQuery ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) : true
    );

  const pinnedItems = filteredItems.filter((item) => item.pinned);
  const regularItems = filteredItems.filter((item) => !item.pinned);

  const stats = useMemo(
    () => [
      { label: "Regions", value: "3" },
      { label: "Languages", value: "3" },
      { label: "Content types", value: "6" },
      { label: "Total content", value: items.length },
    ],
    [items.length]
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      {/* Hero / Header */}
      <header
        style={{
          background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #111827 100%)",
          color: "white",
          padding: "2.5rem 2rem 2rem",
          boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "2rem", alignItems: "center" }}>
            <div>
              <p style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.75rem" }}>
                Content Management Platform
              </p>
              <h1 style={{ fontSize: "2.75rem", fontWeight: 800, lineHeight: 1.15, marginBottom: "0.75rem" }}>
                Draft, approve, publish content across regions
              </h1>
              <p style={{ fontSize: "1.05rem", opacity: 0.9, maxWidth: "820px", marginBottom: "1.5rem" }}>
                Create, review, approve, and publish content across regions and languages with full audit trails.
              </p>

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <Link href="/dashboard" className="btn btn-primary" style={{ boxShadow: "0 12px 30px rgba(59,130,246,0.35)" }}>
                  ➕ Create content
                </Link>
                <Link href="/dashboard" className="btn" style={{ background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.18)" }}>
                  📊 Dashboard
                </Link>
              </div>
            </div>

            <div className="card" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", color: "white" }}>
              <h3 style={{ marginBottom: "0.75rem", fontSize: "1.05rem", opacity: 0.9 }}>Live controls</h3>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "0.85rem", opacity: 0.85 }}>🌍 Region</label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.65rem 0.75rem",
                        borderRadius: "0.65rem",
                        border: "1px solid rgba(255,255,255,0.3)",
                        background: "rgba(255,255,255,0.08)",
                        color: "white",
                      }}
                    >
                      <option value="US">🇺🇸 United States</option>
                      <option value="JP">🇯🇵 Japan</option>
                      <option value="RU">🇷🇺 Russia</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "0.85rem", opacity: 0.85 }}>🗣️ Language</label>
                    <select
                      value={lang}
                      onChange={(e) => setLang(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.65rem 0.75rem",
                        borderRadius: "0.65rem",
                        border: "1px solid rgba(255,255,255,0.3)",
                        background: "rgba(255,255,255,0.08)",
                        color: "white",
                      }}
                    >
                      <option value="en">English</option>
                      <option value="ja">日本語</option>
                      <option value="ru">Русский</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: "0.85rem", opacity: 0.85 }}>📑 Content type</label>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.65rem 0.75rem",
                        borderRadius: "0.65rem",
                        border: "1px solid rgba(255,255,255,0.3)",
                        background: "rgba(255,255,255,0.08)",
                        color: "white",
                      }}
                    >
                      <option value="all">All types</option>
                      <option value="ARTICLE">Articles</option>
                      <option value="POLICY">Policies</option>
                      <option value="ANNOUNCEMENT">Announcements</option>
                      <option value="CAMPAIGN">Campaigns</option>
                      <option value="GUIDELINE">Guidelines</option>
                      <option value="FAQ">FAQs</option>
                    </select>
                  </div>
                </div>

                <input
                  type="search"
                  placeholder="🔍 Search titles"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: "0.65rem 0.9rem",
                    borderRadius: "0.65rem",
                    border: "1px solid rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.08)",
                    color: "white",
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginTop: "1.5rem" }}>
            {stats.map((s) => (
              <div key={s.label} className="card" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 700 }}>{s.value}</div>
                <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: "1400px", margin: "2rem auto", padding: "0 2rem" }}>
        {err && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecdd3",
              color: "#b91c1c",
              padding: "1rem",
              borderRadius: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            {err}
          </div>
        )}

        {/* Pillars */}
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>Platform features</h2>
          <div style={{ display: "grid", gap: "0.9rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {valuePillars.map((p) => (
              <div key={p.title} className="card" style={{ borderStyle: "solid", borderColor: "var(--border)" }}>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.35rem" }}>{p.title}</h3>
                <p style={{ color: "#475569", fontSize: "0.95rem" }}>{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pinned */}
        {pinnedItems.length > 0 && (
          <section style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" }}>📌 Pinned content</h2>
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
              {pinnedItems.map((item) => (
                <FeedCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Regular */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>📰 All content</h2>
            <span style={{ fontSize: "0.875rem", color: "#64748b" }}>{filteredItems.length} items</span>
          </div>
          {filteredItems.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
              <p style={{ color: "#64748b" }}>No content available for this region and language.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {regularItems.map((item) => (
                <FeedCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  return (
    <Link
      href={`/content/${item.id}?lang=${item.displayLanguage}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div className="card" style={{ display: "grid", gap: "0.75rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <span style={{ fontSize: "1.5rem" }}>{CONTENT_TYPE_ICONS[item.contentType] || "📄"}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{item.title}</div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", color: "#475569", fontSize: "0.9rem" }}>
                <span>{item.contentType}</span>
                <span>•</span>
                <span>{item.category}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <span
              className="badge"
              style={{ background: STATUS_COLORS[item.status] || "#94a3b8", color: "white" }}
            >
              {item.status}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.875rem", color: "#64748b" }}>
          <span>🌍 {item.region} • 📅 {new Date(item.publishedAt).toLocaleDateString()}</span>
          <span>🗣️ {item.displayLanguage.toUpperCase()}</span>
        </div>
      </div>
    </Link>
  );
}
