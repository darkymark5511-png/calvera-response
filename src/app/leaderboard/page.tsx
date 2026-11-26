"use client";

import PageShell from "@/components/PageShell";
import { useLanguage } from "@/lib/language";

export default function LeaderboardPage() {
  const { t } = useLanguage();
  return (
    <PageShell title={t.leaderboard.heading}>
      <p className="page-note">{t.leaderboard.comingSoon}</p>
    </PageShell>
  );
}
