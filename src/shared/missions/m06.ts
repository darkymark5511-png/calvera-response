import type { MissionDef } from "../types";

const m06: MissionDef = {
  id: 6,
  titleKey: "mission.m6.title",
  codenameKey: "mission.m6.codename",
  mode: "BOMB_DISPOSAL",
  seed: 62044,
  timeLimitSec: 480,
  floors: 1,
  weather: "overcast",
  timeOfDay: "dusk",
  darkness: 0.6,
  roeRecommend: "DYNAMIC",
  objectives: [
    { id: "duarte", key: "Neutralize Duarte without detonation", required: true },
    { id: "device", key: "Secure the device", required: true },
    { id: "workers", key: "Evacuate workers", required: true },
  ],
  outcomes: [
    { id: "DEVICE_DISARMED_ARREST", key: "outcome.m6.disarmed", caldwellLineKey: "outcome.m6.disarmed" },
    { id: "DEVICE_DISARMED_CASUALTIES", key: "outcome.m6.casualties", caldwellLineKey: "outcome.m6.casualties" },
    { id: "DETONATION_PARTIAL", key: "outcome.m6.partial", caldwellLineKey: "outcome.m6.partial" },
    { id: "DETONATION_FULL", key: "outcome.m6.full", caldwellLineKey: "outcome.m6.full" },
  ],
  briefingKeys: ["caldwell.brief_m6"],
  intelKeys: ["intel.m6.1"],
  ruleModules: ["bomb"],
  suspects: [
    { name: "Hector Duarte", role: "trigger", aggression: 0.85, composure: 0.55, surrender: 0.1 },
  ],
  hostages: [{ name: "Rafael Soto" }],
  civilians: [{ role: "worker" }, { role: "worker" }, { role: "worker" }],
};

export default m06;
