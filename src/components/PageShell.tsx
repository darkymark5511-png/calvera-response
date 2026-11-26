"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language";

export default function PageShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <main className="page">
      <h1 className="page-title">{title}</h1>
      {children}
      <Link className="back-link" href="/">
        {t.settings.back}
      </Link>
    </main>
  );
}
