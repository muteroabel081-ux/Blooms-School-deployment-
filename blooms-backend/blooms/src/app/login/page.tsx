"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: "0 16px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 380,
        background: "#111",
        border: "1px solid #1f1f1f",
        borderRadius: 16,
        padding: "36px 32px",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 800,
            color: "#000",
          }}>B</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>BLOOMS Junior School</div>
            <div style={{ fontSize: 11, color: "#555" }}>Backend Administration</div>
          </div>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#fff", margin: "0 0 6px" }}>Sign in</h1>
        <p style={{ fontSize: 13, color: "#555", margin: "0 0 28px" }}>Access the school management API</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 6, fontWeight: 500 }}>Email address</label>
            <input
              type="email"
              placeholder="you@bloomsjunior.school"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #2a2a2a",
                borderRadius: 8,
                background: "#0a0a0a",
                color: "#e5e5e5",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 6, fontWeight: 500 }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #2a2a2a",
                borderRadius: 8,
                background: "#0a0a0a",
                color: "#e5e5e5",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div style={{ background: "#1a0a0a", border: "1px solid #3a1a1a", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#f87171" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              padding: "11px 0",
              borderRadius: 8,
              border: "none",
              background: loading ? "#2a2a2a" : "linear-gradient(135deg, #f59e0b, #d97706)",
              color: loading ? "#555" : "#000",
              fontWeight: 700,
              fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "opacity 0.2s",
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: "14px 16px", background: "#0d0d0a", border: "1px solid #1f1e10", borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: "#444", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Need access?</div>
          <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>
            Contact the system administrator or refer to the setup documentation for credentials.
          </div>
        </div>
      </div>
    </div>
  );
}
