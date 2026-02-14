"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getToken } from "@/lib/token";
import { publishContent } from "@/lib/api";

type DraftEntry = {
  id: number;
  title: string;
  region: string;
  language: string;
  status: "DRAFT" | "PENDING_APPROVAL";
  createdAt: string;
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

function saveDrafts(drafts: DraftEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

export default function ApprovalsPage() {
  const [drafts, setDrafts] = useState<DraftEntry[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [manualId, setManualId] = useState("");

  useEffect(() => {
    setDrafts(loadDrafts());
  }, []);

  const pending = drafts.filter((d) => d.status === "PENDING_APPROVAL");

  const approve = async (id: number) => {
    setErr(null);
    setMessage(null);
    setLoadingId(id);

    try {
      const token = await getToken();
      await publishContent(token, id);

      const nextDrafts = drafts.filter((d) => d.id !== id);
      setDrafts(nextDrafts);
      saveDrafts(nextDrafts);

      setMessage(`Approved and published (ID ${id}).`);
    } catch (e: any) {
      setErr(e.message || "Failed to approve.");
    } finally {
      setLoadingId(null);
    }
  };

  const approveManual = () => {
    const id = Number(manualId);
    if (!id) {
      setErr("Enter a valid content ID.");
      return;
    }
    approve(id);
  };

  return (
    <div>
      <header className="topbar">
        <div className="brand">
          <div className="logo">RB</div>
          <div>
            <h1>Approvals</h1>
            <p className="subtle">Admin review and publish</p>
          </div>
        </div>
        <nav className="nav">
          <Link href="/">Published</Link>
          <Link href="/drafts">Drafts</Link>
          <Link className="active" href="/approvals">Approvals</Link>
        </nav>
      </header>

      <div className="app-shell">
        <section className="panel" style={{ marginBottom: "1.5rem" }}>
          <h2 className="panel-title">Admin approver</h2>
          <p className="subtle">Approver: admin</p>

          <div className="field" style={{ marginTop: "1rem", maxWidth: "360px" }}>
            <label>Approve by content ID</label>
            <input
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="Enter content ID"
            />
          </div>
          <button className="btn btn-primary" style={{ marginTop: "0.75rem" }} onClick={approveManual}>
            Publish
          </button>

          {err && <p className="error" style={{ marginTop: "0.75rem" }}>{err}</p>}
          {message && <p className="subtle" style={{ marginTop: "0.75rem" }}>{message}</p>}
        </section>

        <section className="panel">
          <h2 className="panel-title">Pending approvals</h2>
          {pending.length === 0 && <p className="subtle">No pending approvals.</p>}

          {pending.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Region</th>
                    <th>Language</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((draft) => (
                    <tr key={draft.id}>
                      <td>{draft.id}</td>
                      <td>{draft.title}</td>
                      <td>{draft.region}</td>
                      <td>{draft.language.toUpperCase()}</td>
                      <td>{new Date(draft.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-primary"
                          onClick={() => approve(draft.id)}
                          disabled={loadingId === draft.id}
                        >
                          {loadingId === draft.id ? "Publishing..." : "Approve & publish"}
                        </button>
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
