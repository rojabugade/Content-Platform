"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createContent, upsertVariant, publishContent } from "@/lib/api";
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
  coverImage?: string;
  scheduledPublishAt?: string;
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

const CATEGORIES = [
  "TRADES",
  "MARKETS",
  "COMPLIANCE",
  "RISK_MANAGEMENT",
  "POLICY",
  "OPERATIONS",
  "RESEARCH",
  "ALERTS",
  "PRODUCT_NEWS",
  "TRAINING",
  "CLIENT_SERVICES",
  "TECHNOLOGY",
  "REGULATORY",
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
  const [activeTab, setActiveTab] = useState<"create" | "recent" | "manage">("create");
  const [manageFilter, setManageFilter] = useState<"IN_REVIEW" | "APPROVED">("IN_REVIEW");
  const [previewDraft, setPreviewDraft] = useState<DraftEntry | null>(null);
  const [coverImage, setCoverImage] = useState("");
  const [scheduledPublishAt, setScheduledPublishAt] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

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
    setCoverImage("");
    setScheduledPublishAt("");
    setCoverImageFile(null);
    // Clear the contentEditable div
    const editor = document.querySelector('[contenteditable="true"]') as HTMLDivElement;
    if (editor) editor.innerHTML = "";
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    setCoverImage(draft.coverImage || "");
    setScheduledPublishAt(draft.scheduledPublishAt || "");
    // Update the contentEditable div
    const editor = document.querySelector('[contenteditable="true"]') as HTMLDivElement;
    if (editor) editor.innerHTML = draft.body || "";
    // Scroll to top and switch to create tab
    setActiveTab("create");
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
        coverImage: coverImage || undefined,
        scheduledPublishAt: scheduledPublishAt || undefined,
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

      // Reset form logic:
      // - If creating new draft or submitting for approval: reset for new content
      // - If updating existing draft without submitting: keep edit mode active
      if (editingDraftId === null || mode === "review") {
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
          <Link className="active" href="/drafts">Dashboard</Link>
        </nav>
      </header>

      <div className="app-shell">
        {/* Tab Navigation */}
        <div className="panel" style={{ marginBottom: "1.5rem", padding: "0.75rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              className={`btn ${activeTab === "create" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setActiveTab("create")}
            >
              Create Draft
            </button>
            <button
              className={`btn ${activeTab === "recent" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setActiveTab("recent")}
            >
              Recent Drafts
            </button>
            <button
              className={`btn ${activeTab === "manage" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setActiveTab("manage")}
            >
              Manage & Review
            </button>
          </div>
        </div>

        {/* Create Draft Section */}
        {activeTab === "create" && (
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
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
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

          <div className="grid-2" style={{ marginTop: "1rem" }}>
            <div className="field">
              <label>Cover Image (optional)</label>
              <input 
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ padding: "0.5rem" }}
              />
              <input 
                value={coverImage && !coverImageFile ? coverImage : ''} 
                onChange={(e) => {
                  setCoverImage(e.target.value);
                  setCoverImageFile(null);
                }}
                placeholder="Or paste image URL"
                style={{ marginTop: "0.5rem" }}
              />
              {coverImage && (
                <div style={{ marginTop: "0.5rem", border: "1px solid var(--border)", borderRadius: "8px", overflow: "hidden", maxHeight: "160px" }}>
                  <img src={coverImage} alt="Cover preview" style={{ width: "100%", height: "auto", display: "block" }} />
                </div>
              )}
            </div>
            <div className="field">
              <label>Scheduled Publish Time (optional)</label>
              <input 
                type="datetime-local"
                value={scheduledPublishAt} 
                onChange={(e) => setScheduledPublishAt(e.target.value)}
              />
              {scheduledPublishAt && (
                <p className="subtle" style={{ marginTop: "0.25rem", fontSize: "0.8rem" }}>
                  Will publish on {new Date(scheduledPublishAt).toLocaleString()}
                </p>
              )}
            </div>
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
        )}

        {/* Recent Drafts Section */}
        {activeTab === "recent" && (
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
                        <select
                          onChange={(e) => {
                            const action = e.target.value;
                            if (action === 'preview') setPreviewDraft(draft);
                            else if (action === 'edit') loadDraftForEdit(draft);
                            else if (action === 'delete') deleteDraft(draft.id);
                            e.target.value = ''; // Reset dropdown
                          }}
                          style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            background: '#fff',
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="">Actions ▼</option>
                          <option value="preview">Preview</option>
                          <option value="edit">Edit</option>
                          <option value="delete">Delete</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        )}

        {/* Manage & Review Section */}
        {activeTab === "manage" && (
        <section className="panel">
          <h2 className="panel-title">Manage & Review</h2>
          <p className="subtle" style={{ marginBottom: "1rem" }}>Review and approve content drafts</p>

          {/* Sub-tabs for In Review and Approved */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "2px solid var(--border)", paddingBottom: "0.5rem" }}>
            <button
              onClick={() => setManageFilter("IN_REVIEW")}
              style={{
                padding: "0.5rem 1rem",
                background: manageFilter === "IN_REVIEW" ? "var(--accent)" : "transparent",
                color: manageFilter === "IN_REVIEW" ? "#fff" : "var(--ink-soft)",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.9rem"
              }}
            >
              In Review
            </button>
            <button
              onClick={() => setManageFilter("APPROVED")}
              style={{
                padding: "0.5rem 1rem",
                background: manageFilter === "APPROVED" ? "var(--accent)" : "transparent",
                color: manageFilter === "APPROVED" ? "#fff" : "var(--ink-soft)",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.9rem"
              }}
            >
              Approved
            </button>
          </div>

          {(() => {
            const filtered = drafts.filter(d =>
              manageFilter === "IN_REVIEW" ? d.status === "PENDING_APPROVAL" : d.status === "DRAFT"
            );

            if (filtered.length === 0) {
              return <p className="subtle">No items {manageFilter === "IN_REVIEW" ? "in review" : "approved"} yet.</p>;
            }

            return (
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Region</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((draft) => (
                      <tr key={draft.id}>
                        <td>{draft.id}</td>
                        <td>{draft.title}</td>
                        <td>{draft.region}</td>
                        <td>{draft.category}</td>
                        <td>
                          <span className="pill">{draft.priority}</span>
                        </td>
                        <td>
                          <span className="pill">{draft.status}</span>
                        </td>
                        <td>{new Date(draft.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => setPreviewDraft(draft)}
                              className="btn btn-ghost" 
                              style={{ minWidth: 'auto', padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                            >
                              View
                            </button>
                            {manageFilter === "IN_REVIEW" && (
                              <button
                                onClick={async () => {
                                  try {
                                    setLoading(true);
                                    const token = await getToken();
                                    await publishContent(token, draft.id);
                                    
                                    // Update draft status to published but keep coverImage in localStorage
                                    const nextDrafts = drafts.map(d => 
                                      d.id === draft.id 
                                        ? { ...d, status: "DRAFT" as const } // Keep it as DRAFT so cover image persists
                                        : d
                                    );
                                    setDrafts(nextDrafts);
                                    saveDrafts(nextDrafts);
                                    
                                    setMessage(`Draft ${draft.id} published successfully!`);
                                  } catch (e: any) {
                                    setErr(e.message || "Failed to publish draft");
                                  } finally {
                                    setLoading(false);
                                  }
                                }}
                                className="btn btn-primary"
                                style={{ minWidth: 'auto', padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                disabled={loading}
                              >
                                Approve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </section>
        )}
      </div>

      {/* Preview Modal */}
      {previewDraft && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(11, 18, 32, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "2rem"
          }}
          onClick={() => setPreviewDraft(null)}
        >
          <div 
            className="panel"
            style={{
              maxWidth: "800px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewDraft(null)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "var(--danger)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "1.2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ×
            </button>

            {/* Cover Image */}
            {previewDraft.coverImage && (
              <div style={{ marginBottom: "1.5rem", borderRadius: "12px", overflow: "hidden", aspectRatio: "16 / 6" }}>
                <img src={previewDraft.coverImage} alt={previewDraft.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            )}

            {/* Title */}
            <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>{previewDraft.title}</h2>

            {/* Meta Information */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
              <span className="pill">{previewDraft.region}</span>
              <span className="pill">{previewDraft.language.toUpperCase()}</span>
              <span className="pill">{previewDraft.category}</span>
              <span className="pill">{previewDraft.priority}</span>
              <span className="pill accent">{previewDraft.status}</span>
              {previewDraft.internal && <span className="pill" style={{ background: "#fff3cd", color: "#856404" }}>Internal</span>}
            </div>

            {/* Tags */}
            {previewDraft.tags && (
              <div style={{ marginBottom: "1.5rem" }}>
                <h4 style={{ fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: "0.5rem" }}>Tags</h4>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {previewDraft.tags.split(",").map((tag, i) => (
                    <span key={i} className="tag">{tag.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Scheduled Publish */}
            {previewDraft.scheduledPublishAt && (
              <div style={{ marginBottom: "1.5rem", padding: "0.75rem", background: "#e8f4f1", borderRadius: "8px" }}>
                <h4 style={{ fontSize: "0.875rem", color: "var(--accent-dark)", marginBottom: "0.25rem" }}>Scheduled Publish</h4>
                <p style={{ fontSize: "0.95rem", color: "var(--ink)" }}>{new Date(previewDraft.scheduledPublishAt).toLocaleString()}</p>
              </div>
            )}

            {/* Body Content */}
            <div 
              style={{ 
                lineHeight: "1.75", 
                fontSize: "1rem",
                borderTop: "2px solid var(--border)",
                paddingTop: "1.5rem"
              }}
              dangerouslySetInnerHTML={{ __html: previewDraft.body }}
            />

            {/* Footer Info */}
            <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
              <p className="subtle">Created: {new Date(previewDraft.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
