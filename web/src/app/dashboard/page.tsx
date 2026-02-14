"use client";

import Link from "next/link";

export default function DashboardHub() {
  return (
    <div>
      <header className="topbar">
        <div className="brand">
          <Link href="/">
            <div className="logo">RB</div>
          </Link>
          <div>
            <h1>RB Bank Content Publisher</h1>
            <p className="subtle">Choose a workspace to continue</p>
          </div>
        </div>
        <nav className="nav">
          <Link href="/">Published</Link>
          <Link href="/drafts">Dashboard</Link>
        </nav>
      </header>

      <div className="app-shell">
        <section className="panel">
          <h2 className="panel-title">Content workspaces</h2>
          <p className="subtle" style={{ marginBottom: "1.5rem" }}>
            Manage your content lifecycle in one unified dashboard.
          </p>
          <div className="grid-2">
            <div className="panel">
              <h3>Published Content</h3>
              <p className="subtle">View live content by region and language with rich cover images.</p>
              <Link className="btn btn-primary" href="/">
                View published
              </Link>
            </div>
            <div className="panel">
              <h3>Content Dashboard</h3>
              <p className="subtle">Create drafts, manage recent drafts, and review content for approval.</p>
              <Link className="btn btn-primary" href="/drafts">
                Open dashboard
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
