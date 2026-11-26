import type { Strings } from "./strings";

export const en: Strings = {
  menu: {
    playAsGuest: "PLAY AS GUEST",
    signIn: "SIGN IN (optional, sync progress)",
    career: "CAREER",
    armory: "ARMORY",
    settings: "SETTINGS",
    leaderboard: "LEADERBOARD",
  },
  title: "Calvera Response",
  subtitle: "Calvera Bay Tactical Response Unit",
  status: {
    dbOnline: "DB: online",
    dbOffline: "DB: offline",
    offlineNotice: "Server offline. Playing locally.",
  },
  build: "Build",
  language: { label: "Language", en: "English", id: "Indonesian" },
  hq: {
    heading: "Headquarters",
    guestNotice: "Playing as guest. Progress is stored on this device only.",
    signedInNotice: "Signed in. Progress syncs to the server.",
    back: "Back to menu",
    progressHeading: "Local progress",
    progressEmpty: "No local progress yet.",
  },
  profile: {
    heading: "Profile",
    optionalNote:
      "Signing in is optional. Guests can play everything on this device.",
    username: "Username",
    password: "Password",
    signIn: "Sign in",
    createAccount: "Create account",
    needAccount: "Need an account?",
    haveAccount: "Already have an account?",
    signOut: "Sign out",
    signedInAs: "Signed in as",
  },
  career: {
    heading: "Career",
    nextMission: "Next mission",
    funds: "Funds",
    noData: "Sign in or play a mission to load career data.",
    back: "Back to menu",
  },
  armory: {
    heading: "Armory",
    comingSoon: "The 3D armory arrives in Phase 3.",
    back: "Back to menu",
  },
  leaderboard: {
    heading: "Leaderboard",
    comingSoon: "Leaderboards arrive in Phase 6.",
    back: "Back to menu",
  },
  settings: {
    heading: "Settings",
    languageHeading: "Language",
    accountHeading: "Account",
    accountNote:
      "Sign in is optional. Only signed-in accounts sync progress and scores to the server; guests keep everything on this device.",
    back: "Back to menu",
  },
  common: {
    offline: "Server offline. Playing locally.",
    loading: "Loading",
    invalidJson: "Invalid JSON body.",
    genericError: "Something went wrong.",
  },
};
