"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const API_ROUTES = [
  { method: "GET", path: "/api/students", desc: "List students (filter: classId, active, q)" },
  { method: "POST", path: "/api/students", desc: "Create a student" },
  { method: "GET", path: "/api/students/[id]", desc: "Get student by ID" },
  { method: "PATCH", path: "/api/students/[id]", desc: "Update student" },
  { method: "DELETE", path: "/api/students/[id]", desc: "Delete student" },
  { method: "GET", path: "/api/staff", desc: "List staff (filter: role, active, q)" },
  { method: "POST", path: "/api/staff", desc: "Create staff member" },
  { method: "GET", path: "/api/staff/[id]", desc: "Get staff by ID" },
  { method: "PATCH", path: "/api/staff/[id]", desc: "Update staff member" },
  { method: "DELETE", path: "/api/staff/[id]", desc: "Delete staff member" },
  { method: "GET", path: "/api/classes", desc: "List classes (filter: year, level)" },
  { method: "POST", path: "/api/classes", desc: "Create a class" },
  { method: "GET", path: "/api/classes/[id]", desc: "Get class by ID" },
  { method: "PATCH", path: "/api/classes/[id]", desc: "Update class" },
  { method: "DELETE", path: "/api/classes/[id]", desc: "Delete class" },
  { method: "GET", path: "/api/fees", desc: "List fees (filter: studentId, status)" },
  { method: "POST", path: "/api/fees", desc: "Create fee record" },
  { method: "GET", path: "/api/fees/[id]", desc: "Get fee by ID" },
  { method: "PATCH", path: "/api/fees/[id]", desc: "Update fee" },
  { method: "DELETE", path: "/api/fees/[id]", desc: "Delete fee" },
  { method: "GET", path: "/api/scores", desc: "List scores (filter: studentId, term, year)" },
  { method: "POST", path: "/api/scores", desc: "Record a score" },
  { method: "PATCH", path: "/api/scores/[id]", desc: "Update score" },
  { method: "DELETE", path: "/api/scores/[id]", desc: "Delete score" },
  { method: "GET", path: "/api/attendance", desc: "List attendance (filter: classId, date, studentId)" },
  { method: "POST", path: "/api/attendance", desc: "Record attendance" },
  { method: "PATCH", path: "/api/attendance/[id]", desc: "Update attendance record" },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "#22c55e",
  POST: "#3b82f6",
  PATCH: "#f59e0b",
  DELETE: "#ef4444",
};

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
        <div style={{ color: "#888", fontSize: 14 }}>Loading…</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e5e5e5", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1f1f1f", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #f59e0b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#000" }}>B</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>BLOOMS Junior School</div>
            <div style={{ fontSize: 11, color: "#555" }}>Backend API — v0.2.1</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, color: "#ccc" }}>{session.user?.name || session.user?.email}</div>
            <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>{(session.user as { role?: string })?.role || "STAFF"}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #2a2a2a", background: "transparent", color: "#888", fontSize: 13, cursor: "pointer" }}
          >
            Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 32px" }}>
        {/* Status Banner */}
        <div style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: 10, padding: "16px 20px", marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#4ade80" }}>API Server Running</div>
            <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>All endpoints available · SQLite database connected · NextAuth session active</div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
          {[
            { label: "Total Endpoints", value: API_ROUTES.length, color: "#3b82f6" },
            { label: "Auth Provider", value: "NextAuth JWT", color: "#f59e0b" },
            { label: "Database", value: "SQLite (local)", color: "#8b5cf6" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 10, padding: "20px 24px" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* API Routes Table */}
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Available Endpoints</h2>
          <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "80px 260px 1fr", padding: "10px 20px", borderBottom: "1px solid #1a1a1a", fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: 1 }}>
              <div>Method</div>
              <div>Path</div>
              <div>Description</div>
            </div>
            {API_ROUTES.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 260px 1fr",
                  padding: "11px 20px",
                  borderBottom: i < API_ROUTES.length - 1 ? "1px solid #161616" : "none",
                  alignItems: "center",
                }}
              >
                <div>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: METHOD_COLORS[r.method] ?? "#888",
                    background: (METHOD_COLORS[r.method] ?? "#888") + "18",
                    padding: "2px 8px",
                    borderRadius: 4,
                    letterSpacing: 0.5,
                  }}>
                    {r.method}
                  </span>
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 13, color: "#ccc" }}>{r.path}</div>
                <div style={{ fontSize: 12, color: "#555" }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Login hint */}
        <div style={{ marginTop: 32, padding: "16px 20px", background: "#0d0d1a", border: "1px solid #1a1a2e", borderRadius: 10 }}>
          <div style={{ fontSize: 12, color: "#444", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Access</div>
          <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>
            Admin account is created via <code style={{ color: "#444" }}>npm run db:seed</code>. Refer to the README for setup instructions and contact the system administrator for credentials.
          </div>
        </div>
      </div>
    </div>
  );
}
