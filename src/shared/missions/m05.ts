import type { MissionDef } from "../types";

const m05: MissionDef = {
  id: 5,
  titleKey: "mission.m5.title",
  codenameKey: "mission.m5.codename",
  mode: "WARRANT_SEARCH",
  seed: 51901,
  timeLimitSec: 1200,
  floors: 9,
  weather: "clear",
  timeOfDay: "dusk",
  darkness: 0.5,
  roeRecommend: "DYNAMIC",
  objectives: [
    { id: "room812", key: "Secure room 812 only", required: true },
    { id: "target", key: "Arrest Elliot Brandt", required: true },
    { id: "evidence", key: "Recover ledger and hard drive", required: true },
  ],
  outcomes: [
    { id: "CLEAN_ARREST_WITH_EVIDENCE", key: "outcome.m5.evidence", caldwellLineKey: "outcome.m5.evidence" },
    { id: "ARREST_NO_EVIDENCE", key: "outcome.m5.no_evidence", caldwellLineKey: "outcome.m5.no_evidence" },
    { id: "WARRANT_VIOLATION", key: "outcome.m5.violation", caldwellLineKey: "outcome.m5.violation" },
    { id: "FAILED", key: "outcome.m5.failed", caldwellLineKey: "outcome.m5.failed" },
  ],
  briefingKeys: ["caldwell.brief_m5"],
  intelKeys: ["intel.m5.1"],
  ruleModules: ["warrant"],
  suspects: [
    { name: "Elliot Brandt", role: "target", aggression: 0.45, composure: 0.7, surrender: 0.55 },
  ],
  civilians: Array.from({ length: 12 }, () => ({ role: "guest" })),
};

export default m05;
