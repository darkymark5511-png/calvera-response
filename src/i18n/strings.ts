export interface Strings {
  menu: {
    playAsGuest: string;
    signIn: string;
    career: string;
    armory: string;
    settings: string;
    leaderboard: string;
  };
  title: string;
  subtitle: string;
  status: {
    dbOnline: string;
    dbOffline: string;
    offlineNotice: string;
  };
  build: string;
  language: { label: string; en: string; id: string };
  hq: {
    heading: string;
    guestNotice: string;
    signedInNotice: string;
    back: string;
    progressHeading: string;
    progressEmpty: string;
  };
  profile: {
    heading: string;
    optionalNote: string;
    username: string;
    password: string;
    signIn: string;
    createAccount: string;
    needAccount: string;
    haveAccount: string;
    signOut: string;
    signedInAs: string;
  };
  career: {
    heading: string;
    nextMission: string;
    funds: string;
    noData: string;
    back: string;
  };
  armory: {
    heading: string;
    comingSoon: string;
    back: string;
  };
  leaderboard: {
    heading: string;
    comingSoon: string;
    back: string;
  };
  settings: {
    heading: string;
    languageHeading: string;
    accountHeading: string;
    accountNote: string;
    back: string;
  };
  roster: {
    heading: string;
    callsign: string;
    role: { breacher: string; pointMan: string; marksman: string; medic: string; technician: string; negotiator: string; supportGunner: string; scout: string };
    ability: {
      reyes: string; reyesDesc: string;
      okafor: string; okaforDesc: string;
      steven: string; stevenDesc: string;
      whitfield: string; whitfieldDesc: string;
      wiper: string; wiperDesc: string;
      carvajal: string; carvajalDesc: string;
      ellery: string; elleryDesc: string;
      cole: string; coleDesc: string;
    };
    select: string;
    selected: string;
    injured: string;
    level: string;
    accuracy: string;
    composure: string;
    speed: string;
    durability: string;
  };
  cmd: {
    wheel: string;
    moveUp: string; coverMe: string; stackUp: string; breach: string;
    hold: string; flashOut: string; holdFire: string; search: string;
    'moveUp.ack': string; 'coverMe.ack': string; 'stackUp.ack': string; 'breach.ack': string;
    'hold.ack': string; 'flashOut.ack': string; 'holdFire.ack': string; 'search.ack': string;
    'ack.none': string;
    'refusal.noSquad': string;
    'refusal.noRadio': string;
  };
  squad: {
    report: { lightBeam: string };
  };
  roe: {
    allowed: string;
    blocked: { collateral: string; noPositiveId: string; downed: string };
    violation: { nonLethalMode: string; surrendering: string; downed: string; unaware: string };
  };
  pen: {
    material: { drywall: string; plaster: string; plywood: string; hollowDoor: string; solidDoor: string; glass: string; brick: string; concrete: string; steel: string; sandbag: string; bodyArmor: string };
  };
  range: {
    heading: string;
    subtitle: string;
    entry: string;
    awareness: string;
    state: { idle: string; suspicious: string; alerted: string; combat: string };
    moodHeading: string;
    mood: { calm: string; panicked: string; surrendered: string; hostile: string };
    health: string;
    squadHeading: string;
    task: {
      holding: string; moving: string; stacking: string; breaching: string;
      covering: string; flashing: string; searching: string; treating: string; reporting: string;
    };
    ordersHeading: string;
    feedHeading: string;
    feedEmpty: string;
    controlsHeading: string;
    lightOn: string;
    lightOff: string;
    nightVisionOn: string;
    nightVisionOff: string;
    smokeOn: string;
    smokeOff: string;
    fire: string;
    reset: string;
    violations: string;
    noViolations: string;
    penHeading: string;
    penNote: string;
    caliber: string;
    damage: string;
    stopped: string;
    secondsOnRange: string;
    roomLight: string;
    smokeLeft: string;
    suspectLabel: string;
    playerLabel: string;
  };
  common: {
    offline: string;
    loading: string;
    invalidJson: string;
    genericError: string;
  };
}
