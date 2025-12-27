"use client";

import { useState } from "react";
import Link from "next/link";
import { createContent, upsertVariant } from "../../lib/api";
import { getToken } from "../../lib/token";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"create" | "manage" | "analytics">("create");

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      {/* Header */}
      <header
        style={{
          background: "var(--card-bg)",
          borderBottom: "1px solid var(--border)",
          padding: "1.5rem 2rem",
          boxShadow: "0 1px 3px var(--shadow)",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "0.25rem" }}>
                ⚙️ Content Management Dashboard
              </h1>
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                Create, review, approve, and manage enterprise content
              </p>
            </div>
            <Link href="/" className="btn" style={{ background: "var(--border)", color: "var(--foreground)" }}>
              ← Back to Feed
            </Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1400px", margin: "2rem auto", padding: "0 2rem" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", borderBottom: "2px solid var(--border)" }}>
          <button
            onClick={() => setActiveTab("create")}
            style={{
              padding: "0.75rem 1.5rem",
              background: activeTab === "create" ? "var(--primary)" : "transparent",
              color: activeTab === "create" ? "white" : "var(--foreground)",
              border: "none",
              borderBottom: activeTab === "create" ? "3px solid var(--primary)" : "none",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            ➕ Create Content
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            style={{
              padding: "0.75rem 1.5rem",
              background: activeTab === "manage" ? "var(--primary)" : "transparent",
              color: activeTab === "manage" ? "white" : "var(--foreground)",
              border: "none",
              borderBottom: activeTab === "manage" ? "3px solid var(--primary)" : "none",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            📝 Manage & Review
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            style={{
              padding: "0.75rem 1.5rem",
              background: activeTab === "analytics" ? "var(--primary)" : "transparent",
              color: activeTab === "analytics" ? "white" : "var(--foreground)",
              border: "none",
              borderBottom: activeTab === "analytics" ? "3px solid var(--primary)" : "none",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            📊 Analytics & Audit
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "create" && <CreateContentPanel />}
        {activeTab === "manage" && <ManageContentPanel />}
        {activeTab === "analytics" && <AnalyticsPanel />}
      </main>
    </div>
  );
}

function CreateContentPanel() {
  const [formData, setFormData] = useState({
    contentType: "ARTICLE",
    region: "US",
    category: "TRADES",
    priority: "NORMAL",
    tags: "",
    pinned: false,
    internal: false,
    scheduledPublishAt: "",
    scheduledUnpublishAt: "",
  });

  const [draftContent, setDraftContent] = useState({
    title: "",
    body: "",
    language: "en",
  });

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("Content creation functionality will be implemented with backend integration");
  };

  const normalizeDate = (value: string) => (value ? new Date(value).toISOString() : null);

  const validateDraft = () => {
    if (!draftContent.title.trim() || !draftContent.body.trim()) {
      setErrorMessage("Title and body are required before saving.");
      return false;
    }
    return true;
  };

  const performSave = async (mode: "draft" | "review") => {
    if (!validateDraft()) return;

    setStatusMessage(null);
    setErrorMessage(null);
    const setLoading = mode === "draft" ? setIsSavingDraft : setIsSubmittingReview;
    setLoading(true);

    try {
      const token = await getToken();
      const content = await createContent(token, {
        contentType: formData.contentType,
        region: formData.region,
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        priority: formData.priority,
        pinned: formData.pinned,
        scheduledPublishAt: normalizeDate(formData.scheduledPublishAt),
        scheduledUnpublishAt: normalizeDate(formData.scheduledUnpublishAt),
        internal: formData.internal,
      });

      await upsertVariant(token, content.id, {
        languageCode: draftContent.language,
        title: draftContent.title.trim(),
        bodyHtml: draftContent.body.trim(),
        isDefaultLang: true,
      });

      setStatusMessage(
        mode === "draft"
          ? `Draft saved (ID ${content.id}).`
          : `Submitted for review (ID ${content.id}).`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save draft";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1.5rem" }}>
        Create New Content
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {/* Content Type */}
          <div>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>
              📑 Content Type
            </label>
            <select
              value={formData.contentType}
              onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--border)",
                background: "var(--background)",
              }}
            >
              <option value="ARTICLE">📰 Article - Market updates, newsletters</option>
              <option value="POLICY">📋 Policy - Compliance notices, guidelines</option>
              <option value="ANNOUNCEMENT">📢 Announcement - Urgent notices, alerts</option>
              <option value="CAMPAIGN">🎯 Campaign - Marketing banners, promotions</option>
              <option value="GUIDELINE">📘 Guideline - Internal procedures</option>
              <option value="FAQ">❓ FAQ - Frequently asked questions</option>
            </select>
          </div>

          {/* Region and Category */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>
                🌍 Region
              </label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--border)",
                  background: "var(--background)",
                }}
              >
                <option value="US">🇺🇸 United States</option>
                <option value="JP">🇯🇵 Japan</option>
                <option value="RU">🇷🇺 Russia</option>
                <option value="EU">🇪🇺 Europe</option>
                <option value="APAC">🌏 Asia Pacific</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>
                📂 Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--border)",
                  background: "var(--background)",
                }}
              >
                <option value="TRADES">📈 Trades & Markets</option>
                <option value="MARKETING">📣 Marketing</option>
                <option value="COMPLIANCE">⚖️ Compliance</option>
                <option value="HR">👥 Human Resources</option>
                <option value="IT">💻 Technology</option>
                <option value="OPERATIONS">⚙️ Operations</option>
              </select>
            </div>
          </div>

          {/* Priority and Pinning */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>
                ⚡ Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--border)",
                  background: "var(--background)",
                }}
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">🚨 Urgent</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>
                Options
              </label>
              <div style={{ display: "flex", gap: "1rem", paddingTop: "0.5rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.pinned}
                    onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                  />
                  📌 Pin to top
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.internal}
                    onChange={(e) => setFormData({ ...formData, internal: e.target.checked })}
                  />
                  🔒 Internal only
                </label>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>
              🏷️ Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., urgent, quarterly-report, compliance"
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--border)",
                background: "var(--background)",
              }}
            />
          </div>

          {/* Draft Editor Section */}
          <div style={{ borderTop: "2px solid var(--border)", paddingTop: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "700" }}>📝 Draft Content</h3>
              <select
                value={draftContent.language}
                onChange={(e) => setDraftContent({ ...draftContent, language: e.target.value })}
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--border)",
                  background: "var(--background)",
                  fontWeight: "600",
                }}
              >
                <option value="en">🇬🇧 English</option>
                <option value="ja">🇯🇵 日本語 (Japanese)</option>
                <option value="ru">🇷🇺 Русский (Russian)</option>
              </select>
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>
                  📌 Title for {draftContent.language.toUpperCase()}
                </label>
                <input
                  type="text"
                  value={draftContent.title}
                  onChange={(e) => setDraftContent({ ...draftContent, title: e.target.value })}
                  placeholder="Enter content title..."
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border)",
                    background: "var(--background)",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>
                  📄 Body Content (HTML supported)
                </label>
                <textarea
                  value={draftContent.body}
                  onChange={(e) => setDraftContent({ ...draftContent, body: e.target.value })}
                  placeholder="Write your content here... You can use basic HTML tags like <p>, <strong>, <ul>, <li>, etc."
                  style={{
                    width: "100%",
                    minHeight: "300px",
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border)",
                    background: "var(--background)",
                    fontFamily: "monospace",
                    fontSize: "0.95rem",
                    lineHeight: "1.5",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ background: "var(--card-bg)", padding: "1rem", borderRadius: "0.5rem", border: "1px solid var(--border)" }}>
                <p style={{ fontWeight: "600", marginBottom: "0.5rem" }}>📖 Preview:</p>
                <div style={{ maxHeight: "200px", overflowY: "auto", fontSize: "0.95rem", lineHeight: "1.6" }}>
                  {draftContent.title && <div style={{ fontWeight: "700", marginBottom: "0.5rem" }}>{draftContent.title}</div>}
                  <div dangerouslySetInnerHTML={{ __html: draftContent.body || "<p style='color:#999'>Content preview will appear here...</p>" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>
                📅 Schedule Publish
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledPublishAt}
                onChange={(e) => setFormData({ ...formData, scheduledPublishAt: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--border)",
                  background: "var(--background)",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem" }}>
                📅 Schedule Unpublish
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledUnpublishAt}
                onChange={(e) => setFormData({ ...formData, scheduledUnpublishAt: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--border)",
                  background: "var(--background)",
                }}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", paddingTop: "1rem" }}>
            <button
              type="button"
              className="btn"
              onClick={() => performSave("draft")}
              disabled={isSavingDraft || isSubmittingReview}
              style={{
                background: "var(--border)",
                color: "var(--foreground)",
                opacity: isSavingDraft || isSubmittingReview ? 0.7 : 1,
              }}
            >
              {isSavingDraft ? "Saving..." : "💾 Save as Draft"}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => performSave("review")}
              disabled={isSavingDraft || isSubmittingReview}
              style={{
                background: "var(--warning)",
                color: "white",
                opacity: isSavingDraft || isSubmittingReview ? 0.7 : 1,
              }}
            >
              {isSubmittingReview ? "Submitting..." : "📤 Submit for Review"}
            </button>
            <button type="submit" className="btn btn-primary">
              ✅ Create & Publish
            </button>
          </div>

          {(statusMessage || errorMessage) && (
            <div style={{ marginTop: "0.75rem", textAlign: "right" }}>
              {errorMessage && (
                <span style={{ color: "var(--danger)", fontWeight: 600 }}>{errorMessage}</span>
              )}
              {statusMessage && (
                <span style={{ color: "var(--success)", fontWeight: 600, marginLeft: "1rem" }}>{statusMessage}</span>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

function ManageContentPanel() {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div className="card" style={{ textAlign: "center", background: "#fef3c7" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📝</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>12</div>
          <div style={{ fontSize: "0.875rem", color: "#92400e" }}>Drafts</div>
        </div>
        <div className="card" style={{ textAlign: "center", background: "#fed7aa" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏳</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>8</div>
          <div style={{ fontSize: "0.875rem", color: "#9a3412" }}>In Review</div>
        </div>
        <div className="card" style={{ textAlign: "center", background: "#d9f99d" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>5</div>
          <div style={{ fontSize: "0.875rem", color: "#3f6212" }}>Approved</div>
        </div>
        <div className="card" style={{ textAlign: "center", background: "#bfdbfe" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🌐</div>
          <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>156</div>
          <div style={{ fontSize: "0.875rem", color: "#1e3a8a" }}>Published</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" }}>
          Content Workflow Management
        </h3>
        <p style={{ color: "#64748b", marginBottom: "1rem" }}>
          Full lifecycle management: Draft → Review → Approve → Publish → Archive
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[
            { title: "Q4 Market Update", status: "IN_REVIEW", author: "john.doe", date: "2 hours ago" },
            { title: "New Compliance Policy", status: "APPROVED", author: "jane.smith", date: "5 hours ago" },
            { title: "System Maintenance Notice", status: "DRAFT", author: "admin", date: "1 day ago" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: "1rem",
                background: "var(--background)",
                borderRadius: "0.5rem",
                border: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>{item.title}</div>
                <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                  by {item.author} • {item.date}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span
                  className="badge"
                  style={{
                    background:
                      item.status === "APPROVED"
                        ? "#10b981"
                        : item.status === "IN_REVIEW"
                        ? "#f59e0b"
                        : "#94a3b8",
                    color: "white",
                  }}
                >
                  {item.status}
                </span>
                <button className="btn" style={{ padding: "0.375rem 0.75rem", fontSize: "0.875rem" }}>
                  Edit
                </button>
                {item.status === "IN_REVIEW" && (
                  <button
                    className="btn"
                    style={{ padding: "0.375rem 0.75rem", fontSize: "0.875rem", background: "#10b981", color: "white" }}
                  >
                    ✓ Approve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsPanel() {
  return (
    <div>
      <div style={{ display: "grid", gap: "1.5rem" }}>
        <div className="card">
          <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" }}>
            📊 Content Analytics
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.25rem" }}>Total Views</div>
              <div style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--primary)" }}>45,231</div>
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.25rem" }}>Avg. Read Time</div>
              <div style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--success)" }}>4m 32s</div>
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.25rem" }}>Engagement Rate</div>
              <div style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--warning)" }}>68.5%</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" }}>
            📋 Audit Trail & Version History
          </h3>
          <p style={{ color: "#64748b", marginBottom: "1rem" }}>
            Complete audit trail for compliance: who changed what and when
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              {
                action: "Published",
                content: "Q3 Financial Report",
                user: "admin",
                timestamp: "2024-12-20 14:30",
                version: "v3",
              },
              {
                action: "Approved",
                content: "Q3 Financial Report",
                user: "jane.smith",
                timestamp: "2024-12-20 14:15",
                version: "v3",
              },
              {
                action: "Updated",
                content: "Q3 Financial Report",
                user: "john.doe",
                timestamp: "2024-12-20 10:22",
                version: "v3",
              },
              {
                action: "Submitted",
                content: "Q3 Financial Report",
                user: "john.doe",
                timestamp: "2024-12-19 16:45",
                version: "v2",
              },
            ].map((log, i) => (
              <div
                key={i}
                style={{
                  padding: "0.75rem 1rem",
                  background: "var(--background)",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--border)",
                  display: "grid",
                  gridTemplateColumns: "100px 1fr 120px 140px 60px",
                  gap: "1rem",
                  alignItems: "center",
                  fontSize: "0.875rem",
                }}
              >
                <span
                  style={{
                    fontWeight: "600",
                    color:
                      log.action === "Published"
                        ? "#3b82f6"
                        : log.action === "Approved"
                        ? "#10b981"
                        : "#64748b",
                  }}
                >
                  {log.action}
                </span>
                <span>{log.content}</span>
                <span style={{ color: "#64748b" }}>{log.user}</span>
                <span style={{ color: "#64748b" }}>{log.timestamp}</span>
                <span className="badge" style={{ background: "var(--border)", color: "var(--foreground)", justifySelf: "center" }}>
                  {log.version}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
            <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
              <strong>Features:</strong> Version rollback • Change comparison • Compliance reporting • User activity tracking
            </p>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem" }}>
            🚀 Delivery & Performance
          </h3>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "var(--background)", borderRadius: "0.5rem" }}>
              <span>✅ Content cached (Redis)</span>
              <span style={{ fontWeight: "600", color: "#10b981" }}>Active</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "var(--background)", borderRadius: "0.5rem" }}>
              <span>🔍 Search indexing (Elasticsearch)</span>
              <span style={{ fontWeight: "600", color: "#10b981" }}>Active</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "var(--background)", borderRadius: "0.5rem" }}>
              <span>📡 Event publishing (Kafka)</span>
              <span style={{ fontWeight: "600", color: "#10b981" }}>Active</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem", background: "var(--background)", borderRadius: "0.5rem" }}>
              <span>🌐 CDN delivery</span>
              <span style={{ fontWeight: "600", color: "#10b981" }}>Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
