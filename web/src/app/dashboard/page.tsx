"use client";

import Link from "next/link";

export default function DashboardHub() {
  return (
    <div>
      <header className="topbar">
        <div className="brand">
          <div className="logo">RB</div>
          <div>
            <h1>RB Bank Content Publisher</h1>
            <p className="subtle">Choose a workspace to continue</p>
          </div>
        </div>
        <nav className="nav">
          <Link href="/">Published</Link>
          <Link href="/drafts">Drafts</Link>
          <Link href="/approvals">Approvals</Link>
        </nav>
      </header>

      <div className="app-shell">
        <section className="panel">
          <h2 className="panel-title">Content workspaces</h2>
          <p className="subtle" style={{ marginBottom: "1.5rem" }}>
            Keep the flow simple: create drafts, send for approval, then publish.
          </p>
          <div className="grid-3">
            <div className="panel">
              <h3>Published dashboard</h3>
              <p className="subtle">Review live content by region and language.</p>
              <Link className="btn btn-primary" href="/">
                Open published
              </Link>
            </div>
            <div className="panel">
              <h3>Draft studio</h3>
              <p className="subtle">Write drafts and submit them for approval.</p>
              <Link className="btn btn-primary" href="/drafts">
                Create drafts
              </Link>
            </div>
            <div className="panel">
              <h3>Approvals</h3>
              <p className="subtle">Admin reviews and publishes pending drafts.</p>
              <Link className="btn btn-primary" href="/approvals">
                Review approvals
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
