"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { LanguageProvider } from "@/lib/language";
import { SessionProvider } from "@/lib/session-context";

// WebGL only ever loads on the client, after hydration.
const CorridorScene = dynamic(() => import("@/components/scene/CorridorScene"), {
  ssr: false,
});

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showScene = pathname === "/";

  return (
    <LanguageProvider>
      <SessionProvider>
        {showScene ? (
          <div className="scene-layer">
            <CorridorScene />
          </div>
        ) : (
          <div className="scene-layer scene-layer-flat" aria-hidden="true" />
        )}
        <div className="ui-layer">{children}</div>
      </SessionProvider>
    </LanguageProvider>
  );
}
