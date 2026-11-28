"use client";

import { useEffect, useState } from "react";

/** Minimal production boot — no missing-module imports. */
export default function HomePage() {
  const [db, setDb] = useState<"…" | "online" | "offline">("…");
  const [selected, setSelected] = useState(0);
  const items = ["NEW CAREER", "ACCOUNT", "OPTIONS", "LEADERBOARD", "CREDITS"] as const;

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((j: { ok?: boolean }) => setDb(j.ok ? "online" : "offline"))
      .catch(() => setDb("offline"));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") setSelected((s) => Math.min(items.length - 1, s + 1));
      if (e.key === "ArrowUp") setSelected((s) => Math.max(0, s - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length]);

  return (
    <div
      style={{
        width: "100%",
        height: "100dvh",
        background: "#0c0e10",
        color: "#d0d4d8",
        fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif',
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(160deg, #0a1018 0%, #121820 40%, #0c0e10 100%)",
        }}
      />
      <div style={{ position: "absolute", top: 28, left: 28, zIndex: 2 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#e8ecf0",
            position: "relative",
            display: "inline-block",
          }}
        >
          CALVERA RESPONSE
          <span
            style={{
              position: "absolute",
              left: 0,
              right: "18%",
              bottom: -3,
              height: 2,
              background: "#c9a227",
            }}
          />
        </div>
        <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 2 }}>
          {items.map((label, i) => (
            <div
              key={label}
              onClick={() => setSelected(i)}
              onMouseEnter={() => setSelected(i)}
              style={{
                position: "relative",
                padding: "8px 12px 8px 14px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
                fontSize: 15,
                color: selected === i ? "#e8ecf0" : "#8a929a",
                cursor: "pointer",
              }}
            >
              {selected === i && (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 4,
                    bottom: 4,
                    width: 2,
                    background: "#c9a227",
                  }}
                />
              )}
              {label}
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 12,
          fontFamily: '"IBM Plex Mono", Consolas, monospace',
          fontSize: 11,
          color: "#8a929a",
          display: "flex",
          gap: 12,
        }}
      >
        <span style={{ color: db === "online" ? "#3a8a5a" : "#b37a2a" }}>DB: {db}</span>
        <span>cr-1.0.0</span>
      </div>
    </div>
  );
}
