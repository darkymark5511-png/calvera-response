"use client";

import PageShell from "@/components/PageShell";
import { useLanguage } from "@/lib/language";

export default function ArmoryPage() {
  const { t } = useLanguage();
  return (
    <PageShell title={t.armory.heading}>
      <p className="page-note">{t.armory.comingSoon}</p>
    </PageShell>
  );
}
