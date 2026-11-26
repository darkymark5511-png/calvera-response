"use client";

import { useCallback, useMemo, useState } from "react";
import PageShell from "@/components/PageShell";
import { useLanguage } from "@/lib/language";
import { useCareer, updateCareer } from "@/lib/guest";
import { translator } from "@/i18n/lookup";
import {
  CATALOG,
  SLOT_ORDER,
  type EquipmentSlot,
  type Loadout,
} from "@/game/equipment/catalog";
import {
  MAX_LOAD,
  loadoutEffects,
  loadoutWeight,
  mobilityFactor,
} from "@/game/equipment/loadout";
import { afterPurchase, canAfford, formatFunds, resaleValue } from "@/game/economy/funds";

const SLOT_LABEL_KEY: Readonly<Record<EquipmentSlot, string>> = {
  primary: "armory.slots.primary",
  secondary: "armory.slots.secondary",
  optic: "armory.slots.optic",
  armor: "armory.slots.armor",
  helmet: "armory.slots.helmet",
  "night-vision": "armory.slots.nightVision",
  breaching: "armory.slots.breaching",
  throwable: "armory.slots.throwable",
  medical: "armory.slots.medical",
  utility: "armory.slots.utility",
};

export default function ArmoryPage() {
  const { t } = useLanguage();
  const translate = useMemo(() => translator(t), [t]);
  const career = useCareer();
  const [slot, setSlot] = useState<EquipmentSlot>("primary");
  const [notice, setNotice] = useState<string | null>(null);

  const effects = useMemo(() => loadoutEffects(career.loadout), [career.loadout]);
  const weight = useMemo(() => loadoutWeight(career.loadout), [career.loadout]);

  const buy = useCallback(
    (id: string) => {
      const item = CATALOG.find((entry) => entry.id === id);
      if (!item) return;
      if (career.owned.includes(id)) {
        setNotice(t.armory.owned);
        return;
      }
      if (!canAfford(career.funds, item.price)) {
        setNotice(t.armory.noFunds);
        return;
      }
      updateCareer((current) => ({
        ...current,
        funds: afterPurchase(current.funds, item.price),
        owned: [...current.owned, id],
        updatedAt: new Date().toISOString(),
      }));
      setNotice(t.armory.purchased);
    },
    [career.funds, career.owned, t.armory.noFunds, t.armory.owned, t.armory.purchased],
  );

  const sell = useCallback(
    (id: string) => {
      const item = CATALOG.find((entry) => entry.id === id);
      if (!item) return;
      updateCareer((current) => {
        const loadout: Loadout = { ...current.loadout };
        for (const [key, value] of Object.entries(loadout) as [EquipmentSlot, string | undefined][]) {
          if (value === id) delete loadout[key];
        }
        return {
          ...current,
          funds: current.funds + resaleValue(item.price),
          owned: current.owned.filter((entry) => entry !== id),
          loadout,
          updatedAt: new Date().toISOString(),
        };
      });
      setNotice(t.armory.resold);
    },
    [t.armory.resold],
  );

  const equip = useCallback(
    (id: string, targetSlot: EquipmentSlot) => {
      updateCareer((current) => ({
        ...current,
        loadout: { ...current.loadout, [targetSlot]: id },
        updatedAt: new Date().toISOString(),
      }));
    },
    [],
  );

  const clearSlot = useCallback((targetSlot: EquipmentSlot) => {
    updateCareer((current) => {
      const loadout: Loadout = { ...current.loadout };
      delete loadout[targetSlot];
      return { ...current, loadout, updatedAt: new Date().toISOString() };
    });
  }, []);

  const items = CATALOG.filter((item) => item.slot === slot);

  return (
    <PageShell title={t.armory.heading}>
      <p className="page-note">{t.armory.note}</p>
      <p className="page-note armory-funds">{`${t.armory.funds}: ${formatFunds(career.funds)}`}</p>

      <section className="panel">
        <h2 className="panel-title">{t.armory.loadoutHeading}</h2>
        <dl className="stat-list">
          {SLOT_ORDER.map((entry) => {
            const equippedId = career.loadout[entry];
            const equipped = equippedId ? CATALOG.find((item) => item.id === equippedId) : undefined;
            return (
              <div className="stat-row" key={entry}>
                <dt>{translate(SLOT_LABEL_KEY[entry])}</dt>
                <dd>{equipped ? equipped.name : t.armory.emptySlot}</dd>
              </div>
            );
          })}
        </dl>
      </section>

      <section className="panel">
        <h2 className="panel-title">{t.armory.summaryHeading}</h2>
        <dl className="stat-list">
          <div className="stat-row">
            <dt>{t.armory.load}</dt>
            <dd>{translate("armory.loadMax", { load: weight, max: MAX_LOAD })}</dd>
          </div>
          <div className="stat-row">
            <dt>{t.armory.mobility}</dt>
            <dd>{`${Math.round(mobilityFactor(career.loadout) * 100)}%`}</dd>
          </div>
          <div className="stat-row">
            <dt>{t.armory.damageReduction}</dt>
            <dd>{`${Math.round(effects.damageReduction * 100)}%`}</dd>
          </div>
          <div className="stat-row">
            <dt>{t.armory.opticBonus}</dt>
            <dd>{`${Math.round(effects.opticBonus * 100)}%`}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <h2 className="panel-title">{t.armory.catalogHeading}</h2>
        <div className="choice-row">
          {SLOT_ORDER.map((entry) => (
            <button
              key={entry}
              type="button"
              className={`choice-button${slot === entry ? " is-active" : ""}`}
              aria-pressed={slot === entry}
              onClick={() => {
                setSlot(entry);
                setNotice(null);
              }}
            >
              {translate(SLOT_LABEL_KEY[entry])}
            </button>
          ))}
        </div>

        {items.length === 0 ? <p className="page-note">{t.armory.emptySlot}</p> : null}

        <ul className="catalog-list">
          {items.map((item) => {
            const owned = career.owned.includes(item.id);
            const locked = career.missionsCompleted < item.unlockAfterMissions;
            const equipped = career.loadout[item.slot] === item.id;
            return (
              <li className="catalog-item" key={item.id}>
                <div className="catalog-head">
                  <span className="catalog-name">{item.name}</span>
                  <span className="catalog-price">{formatFunds(item.price)}</span>
                </div>
                <p className="catalog-meta">
                  {`${t.armory.manufacturer}: ${item.manufacturer} / ${translate(`armory.itemClass.${item.itemClass}`)}`}
                </p>
                <p className="catalog-note">
                  {translate(`armory.item.${item.id}.note`)}
                  {item.perMission ? ` ${t.armory.perMission}.` : ""}
                </p>
                {locked ? (
                  <p className="catalog-note">
                    {translate("armory.unlockNote", { count: item.unlockAfterMissions })}
                  </p>
                ) : null}
                <div className="catalog-actions">
                  {owned ? (
                    <>
                      {equipped ? (
                        <>
                          <span className="catalog-badge">{t.armory.equipped}</span>
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => clearSlot(item.slot)}
                          >
                            {t.armory.clearSlot}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => equip(item.id, item.slot)}
                        >
                          {t.armory.equip}
                        </button>
                      )}
                      <button type="button" className="text-button" onClick={() => sell(item.id)}>
                        {`${t.armory.sell} ${formatFunds(resaleValue(item.price))}`}
                      </button>
                    </>
                  ) : item.perMission ? (
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => equip(item.id, item.slot)}
                    >
                      {t.armory.equip}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="text-button"
                      disabled={locked}
                      onClick={() => buy(item.id)}
                    >
                      {locked ? t.armory.locked : t.armory.buy}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        {notice ? <p className="page-note form-ok">{notice}</p> : null}
      </section>
    </PageShell>
  );
}
