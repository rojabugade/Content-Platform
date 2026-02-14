"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createContent, upsertVariant } from "@/lib/api";
import { getToken } from "@/lib/token";

type DraftEntry = {
  id: number;
  title: string;
  region: string;
  language: string;
  status: "DRAFT" | "PENDING_APPROVAL";
  createdAt: string;
  contentType: string;
  category: string;
  priority: string;
  tags: string;
  internal: boolean;
  body: string;
};

const STORAGE_KEY = "rb_drafts";

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

const SUGGESTED_TAGS = [
  "trading",
  "markets",
  "compliance",
  "risk",
  "internal",
  "policy",
  "ops",
  "research",
  "alerts",
  "product",
  "training",
  "client",
];

function loadDrafts(): DraftEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DraftEntry[]) : [];
  } catch {
    return [];
  }
}

function saveDrafts(drafts: DraftEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<DraftEntry[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [contentType, setContentType] = useState("ARTICLE");
  const [region, setRegion] = useState("US");
  const [category, setCategory] = useState("TRADES");
  const [priority, setPriority] = useState("NORMAL");
  const [tags, setTags] = useState("");
  const [internal, setInternal] = useState(false);
  const [language, setLanguage] = useState("en");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editorFocused, setEditorFocused] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<number | null>(null);

  useEffect(() => {
    setDrafts(loadDrafts());
  }, []);

  const resetForm = () => {
    setTitle("");
    setBody("");
    setTags("");
    setContentType("ARTICLE");
    setRegion("US");
    setCategory("TRADES");
    setPriority("NORMAL");
    setInternal(false);
    setLanguage("en");
    setEditingDraftId(null);
    // Clear the contentEditable div
    const editor = document.querySelector('[contenteditable="true"]') as HTMLDivElement;
    if (editor) editor.innerHTML = "";
  };

  const loadDraftForEdit = (draft: DraftEntry) => {
    setTitle(draft.title || "");
    setBody(draft.body || "");
    setTags(draft.tags || "");
    setContentType(draft.contentType || "ARTICLE");
    setRegion(draft.region || "US");
    setCategory(draft.category || "TRADES");
    setPriority(draft.priority || "NORMAL");
    setInternal(draft.internal || false);
    setLanguage(draft.language || "en");
    setEditingDraftId(draft.id);
    // Update the contentEditable div
    const editor = document.querySelector('[contenteditable="true"]') as HTMLDivElement;
    if (editor) editor.innerHTML = draft.body || "";
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteDraft = (id: number) => {
    if (!confirm('Delete this draft?')) return;
    const nextDrafts = drafts.filter(d => d.id !== id);
    setDrafts(nextDrafts);
    saveDrafts(nextDrafts);
    setMessage(`Draft ${id} deleted.`);
  };

  const addTag = (tag: string) => {
    const existing = (tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (existing.includes(tag)) return;
    const next = [...existing, tag].join(", ");
    setTags(next);
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    setBody(e.currentTarget.innerHTML);
  };

  const handleSubmit = async (mode: "draft" | "review") => {
    if (!title.trim() || !body.trim()) {
      setErr("Title and body are required.");
      return;
    }

    setErr(null);
    setMessage(null);
    setLoading(true);

    try {
      const token = await getToken();
      let contentId: number;

      // If editing existing draft, just update the variant
      if (editingDraftId !== null) {
        contentId = editingDraftId;
        await upsertVariant(token, contentId, {
          languageCode: language,
          title: title.trim(),
          bodyHtml: body.trim(),
          isDefaultLang: true,
        });
      } else {
        // Create new content
        const created = await createContent(token, {
          contentType,
          region,
          category,
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          priority,
          pinned: false,
          internal,
        });
        contentId = created.id;

        await upsertVariant(token, contentId, {
          languageCode: language,
          title: title.trim(),
          bodyHtml: body.trim(),
          isDefaultLang: true,
        });
      }

      const entry: DraftEntry = {
        id: contentId,
        title: title.trim(),
        region,
        language,
        status: mode === "review" ? "PENDING_APPROVAL" : "DRAFT",
        createdAt: new Date().toISOString(),
        contentType,
        category,
        priority,
        tags,
        internal,
        body: body.trim(),
      };

      // Update or add draft in list
      let nextDrafts: DraftEntry[];
      if (editingDraftId !== null) {
        // Update existing draft
        nextDrafts = drafts.map(d => d.id === editingDraftId ? entry : d);
      } else {
        // Add new draft
        nextDrafts = [entry, ...drafts];
      }
      setDrafts(nextDrafts);
      saveDrafts(nextDrafts);

      setMessage(
        editingDraftId !== null
          ? mode === "review"
            ? `Draft updated and submitted for approval (ID ${contentId}).`
            : `Draft updated (ID ${contentId}).`
          : mode === "review"
          ? `Submitted for approval (ID ${contentId}).`
          : `Draft saved (ID ${contentId}).`
      );

      // Keep edit mode active after updating an existing draft.
      // Otherwise the next save would create a new content record.
      if (editingDraftId === null) {
        resetForm();
      } else {
        setEditingDraftId(contentId);
      }
    } catch (e: any) {
      setErr(e.message || "Failed to save draft.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header className="topbar">
        <div className="brand">
          <div className="logo">RB</div>
          <div>
            <h1>Draft studio</h1>
            <p className="subtle">Create drafts and submit for approval</p>
          </div>
        </div>
        <nav className="nav">
          <Link href="/">Published</Link>
          <Link className="active" href="/drafts">Drafts</Link>
          <Link href="/approvals">Approvals</Link>
        </nav>
      </header>

      <div className="app-shell">
        <section className="panel" style={{ marginBottom: "1.5rem" }}>
          <h2 className="panel-title">
            {editingDraftId !== null ? `Editing draft #${editingDraftId}` : "New draft"}
          </h2>
          <p className="subtle">
            {editingDraftId !== null 
              ? "Update your draft and save changes" 
              : "Write trading or internal news. Default language is EN."}
          </p>

          <div className="grid-2" style={{ marginTop: "1rem" }}>
            <div className="field">
              <label>Content type</label>
              <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
                <option value="ARTICLE">Article</option>
                <option value="POLICY">Policy</option>
                <option value="ANNOUNCEMENT">Announcement</option>
                <option value="GUIDELINE">Guideline</option>
                <option value="FAQ">FAQ</option>
              </select>
            </div>
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
              <label>Category</label>
              <input value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="field">
              <label>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="field">
              <label>Tags (comma separated)</label>
              <input
                list="tag-suggestions"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. trading, markets, compliance"
              />
              <datalist id="tag-suggestions">
                {SUGGESTED_TAGS.map((tag) => (
                  <option key={tag} value={tag} />
                ))}
              </datalist>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                {SUGGESTED_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="tag"
                    onClick={() => addTag(tag)}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                {LANGS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>
                <input
                  type="checkbox"
                  checked={internal}
                  onChange={(e) => setInternal(e.target.checked)}
                  style={{ marginRight: "0.5rem" }}
                />
                Internal only
              </label>
            </div>
          </div>

          <div className="field" style={{ marginTop: "1rem" }}>
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="field" style={{ marginTop: "1rem" }}>
            <label>Body</label>
            <div style={{ marginBottom: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => formatText("bold")}
                style={{ minWidth: "auto", padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}
                title="Bold (Ctrl+B)"
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => formatText("italic")}
                style={{ minWidth: "auto", padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}
                title="Italic (Ctrl+I)"
              >
                <em>I</em>
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => formatText("underline")}
                style={{ minWidth: "auto", padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}
                title="Underline (Ctrl+U)"
              >
                <u>U</u>
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => formatText("insertUnorderedList")}
                style={{ minWidth: "auto", padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}
                title="Bullet List"
              >
                • List
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => formatText("insertOrderedList")}
                style={{ minWidth: "auto", padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}
                title="Numbered List"
              >
                1. List
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => formatText("formatBlock", "h3")}
                style={{ minWidth: "auto", padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}
                title="Heading"
              >
                H3
              </button>
            </div>
            <div
              contentEditable
              onInput={handleEditorInput}
              onFocus={() => setEditorFocused(true)}
              onBlur={() => setEditorFocused(false)}
              dangerouslySetInnerHTML={{ __html: body }}
              style={{
                border: `1px solid ${editorFocused ? "var(--accent)" : "rgba(11, 18, 32, 0.15)"}`,
                borderRadius: "6px",
                padding: "0.75rem",
                minHeight: "200px",
                outline: "none",
                backgroundColor: "white",
                fontFamily: "inherit",
                fontSize: "0.9375rem",
                lineHeight: "1.6",
              }}
            />
          </div>

          {err && <p className="error" style={{ marginTop: "0.75rem" }}>{err}</p>}
          {message && <p className="subtle" style={{ marginTop: "0.75rem" }}>{message}</p>}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <button className="btn btn-ghost" onClick={() => handleSubmit("draft")} disabled={loading}>
              Save draft
            </button>
            <button className="btn btn-primary" onClick={() => handleSubmit("review")} disabled={loading}>
              Submit for approval
            </button>
            {editingDraftId !== null && (
              <button className="btn btn-ghost" onClick={resetForm} style={{ color: "var(--accent)" }}>
                Clear / New draft
              </button>
            )}
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">Recent drafts</h2>
          {drafts.length === 0 && <p className="subtle">No drafts created yet.</p>}

          {drafts.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Region</th>
                    <th>Language</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drafts.map((draft) => (
                    <tr key={draft.id}>
                      <td>{draft.id}</td>
                      <td>{draft.title}</td>
                      <td>{draft.region}</td>
                      <td>{draft.language.toUpperCase()}</td>
                      <td>
                        <span className="pill">{draft.status}</span>
                      </td>
                      <td>{new Date(draft.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <Link href={`/content/${draft.id}`} className="btn btn-ghost" style={{ minWidth: 'auto', padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                            View
                          </Link>
                          <button
                            onClick={() => loadDraftForEdit(draft)}
                            className="btn btn-ghost"
                            style={{ minWidth: 'auto', padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteDraft(draft.id)}
                            className="btn btn-ghost"
                            style={{ minWidth: 'auto', padding: '0.25rem 0.75rem', fontSize: '0.875rem', color: '#d00' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
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
