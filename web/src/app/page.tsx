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

const REGIONS = [
  { code: "US", label: "US" },
  { code: "JP", label: "JP" },
  { code: "RU", label: "RU" },
];

const LANGS = [
  { code: "en", label: "EN" },
  { code: "ja", label: "JP" },
  { code: "ru", label: "RU" },
];

export default function PublishedDashboard() {
  const [region, setRegion] = useState("US");
  const [lang, setLang] = useState("en");
  const [items, setItems] = useState<FeedItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const token = await getToken();
        const data = await apiFetch(`/api/v1/feed?region=${region}&lang=${lang}`, token);
        setItems(data);
      } catch (e: any) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [region, lang]);

  const publishedItems = useMemo(() => {
    return items
      .filter((item) => item.status === "PUBLISHED")
      .filter((item) =>
        query ? item.title.toLowerCase().includes(query.toLowerCase()) : true
      );
  }, [items, query]);

  return (
    <div>
      <header className="topbar">
        <div className="brand">
          <div className="logo">RB</div>
          <div>
            <h1>RB Bank Content Publisher</h1>
            <p className="subtle">RB is the award-winning content, data, analytics and trading platform for Institutional and Corporate clients.</p>
          </div>
        </div>
        <nav className="nav">
          <Link className="active" href="/">Published</Link>
          <Link href="/drafts">Drafts</Link>
          <Link href="/approvals">Approvals</Link>
        </nav>
      </header>

      <div className="app-shell">
        <section className="panel" style={{ marginBottom: "1.5rem" }}>
          <div className="grid-2">
            <div>
              <h2 className="panel-title">What We Offer</h2>
              <p className="subtle">
                Combining RB’s global footprint with world-class innovation, it provides unparalleled access to cross-asset market research, trading desk commentary, proprietary data, analytics, exclusive content, alerts and more to empower our clients to make the most informed investment decisions.
              </p>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Region</label>
                <select value={region} onChange={(e) => setRegion(e.target.value)}>
                  {REGIONS.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Language</label>
                <select value={lang} onChange={(e) => setLang(e.target.value)}>
                  {LANGS.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="grid-3" style={{ marginBottom: "1.5rem" }}>
          <div className="kpi">
            <div className="subtle">Published items</div>
            <h4>{publishedItems.length}</h4>
          </div>
          <div className="kpi">
            <div className="subtle">Region</div>
            <h4>{region}</h4>
          </div>
          <div className="kpi">
            <div className="subtle">Language</div>
            <h4>{lang.toUpperCase()}</h4>
          </div>
        </section>

        <section className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <h3 className="panel-title">Published content</h3>
            <div className="field" style={{ minWidth: "240px" }}>
              <label>Search title</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title"
              />
            </div>
          </div>

          {err && <p className="error" style={{ marginTop: "0.75rem" }}>{err}</p>}
          {loading && <p className="subtle" style={{ marginTop: "0.75rem" }}>Loading published content...</p>}

          {!loading && publishedItems.length === 0 && (
            <p className="subtle" style={{ marginTop: "0.75rem" }}>
              No published content found for this region and language.
            </p>
          )}

          {publishedItems.length > 0 && (
            <div style={{ marginTop: "1rem", overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Region</th>
                    <th>Language</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Published</th>
                  </tr>
                </thead>
                <tbody>
                  {publishedItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Link href={`/content/${item.id}?lang=${lang}`}>
                          {item.title}
                        </Link>
                      </td>
                      <td>{item.region}</td>
                      <td>{item.displayLanguage.toUpperCase()}</td>
                      <td>{item.category}</td>
                      <td>
                        <span className="pill accent">{item.status}</span>
                      </td>
                      <td>{new Date(item.publishedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
