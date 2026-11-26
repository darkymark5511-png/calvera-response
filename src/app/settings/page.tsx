"use client";

import PageShell from "@/components/PageShell";
import { useLanguage } from "@/lib/language";
import { useSession } from "@/lib/session-context";
import { STRINGS, type Lang } from "@/i18n";

const LANGS: Lang[] = ["en", "id"];

export default function SettingsPage() {
  const { t, lang, setLang } = useLanguage();
  const { serverStatus } = useSession();

  return (
    <PageShell title={t.settings.heading}>
      <section className="panel">
        <h2 className="panel-title">{t.settings.languageHeading}</h2>
        <div className="choice-row">
          {LANGS.map((code) => (
            <button
              key={code}
              type="button"
              className={`choice-button${lang === code ? " is-active" : ""}`}
              aria-pressed={lang === code}
              onClick={() => setLang(code)}
            >
              {STRINGS[code].language[code]}
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">{t.settings.accountHeading}</h2>
        <p className="page-note">{t.settings.accountNote}</p>
        {serverStatus === "offline" ? (
          <p className="page-note status-offline-note">{t.status.offlineNotice}</p>
        ) : null}
      </section>
    </PageShell>
  );
}
