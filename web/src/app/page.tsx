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
        
        // Load drafts from localStorage to get cover images
        const drafts = loadDrafts();
        const draftMap = new Map(drafts.map(d => [d.id, d]));
        
        // Merge cover images from localStorage with API data
        const itemsWithImages = data.map((item: FeedItem) => ({
          ...item,
          coverImage: item.coverImage || draftMap.get(item.id)?.coverImage
        }));
        
        setItems(itemsWithImages);
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
          <Link href="/">
            <div className="logo">RB</div>
          </Link>
          <div>
            <h1>RB Bank Content Publisher</h1>
            <p className="subtle">RB is the award-winning content, data, analytics and trading platform for Institutional and Corporate clients.</p>
          </div>
        </div>
        <nav className="nav">
          <Link className="active" href="/">Published</Link>
          <Link href="/drafts">Dashboard</Link>
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
            <div style={{ 
              marginTop: "1.5rem", 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
              gap: "1.25rem" 
            }}>
              {publishedItems.map((item) => (
                <Link 
                  key={item.id} 
                  href={`/content/${item.id}?lang=${lang}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="content-tile">
                    <div className="tile-cover">
                      {item.coverImage ? (
                        <img src={item.coverImage} alt={item.title} />
                      ) : (
                        <div className="tile-default-cover">
                          <div className="logo">RB</div>
                        </div>
                      )}
                    </div>
                    <div className="tile-body">
                      <h3>{item.title}</h3>
                      <div className="tile-meta">
                        <span className="pill">{item.category}</span>
                        <span className="subtle">{item.region}</span>
                        <span className="subtle">{item.displayLanguage.toUpperCase()}</span>
                      </div>
                      <div className="tile-footer">
                        <span className="subtle">{new Date(item.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
