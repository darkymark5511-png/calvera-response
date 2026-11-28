"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const GameApp = dynamic(() => import("@/game/screens/GameApp"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100dvh",
        background: "#0c0e10",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#8a929a",
        fontFamily: '"Barlow Condensed", sans-serif',
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        fontSize: 14,
      }}
    >
      Loading
    </div>
  ),
});

export default function HomePage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div
        style={{
          width: "100%",
          height: "100dvh",
          background: "#0c0e10",
        }}
      />
    );
  }

  return <GameApp />;
}
