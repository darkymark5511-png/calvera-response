import type { Strings } from "./strings";

export const id: Strings = {
  menu: {
    playAsGuest: "MAIN SEBAGAI TAMU",
    signIn: "MASUK (opsional, sinkron progres)",
    career: "KARIER",
    armory: "GUDANG SENJATA",
    settings: "PENGATURAN",
    leaderboard: "PERINGKAT",
  },
  title: "Calvera Response",
  subtitle: "Unit Tanggap Taktis Teluk Calvera",
  status: {
    dbOnline: "DB: online",
    dbOffline: "DB: offline",
    offlineNotice: "Server offline. Bermain secara lokal.",
  },
  build: "Build",
  language: { label: "Bahasa", en: "Inggris", id: "Indonesia" },
  hq: {
    heading: "Markas",
    guestNotice: "Bermain sebagai tamu. Progres hanya tersimpan di perangkat ini.",
    signedInNotice: "Sudah masuk. Progres disinkronkan ke server.",
    back: "Kembali ke menu",
    progressHeading: "Progres lokal",
    progressEmpty: "Belum ada progres lokal.",
  },
  profile: {
    heading: "Profil",
    optionalNote:
      "Masuk bersifat opsional. Tamu dapat memainkan semuanya di perangkat ini.",
    username: "Nama pengguna",
    password: "Kata sandi",
    signIn: "Masuk",
    createAccount: "Buat akun",
    needAccount: "Butuh akun?",
    haveAccount: "Sudah punya akun?",
    signOut: "Keluar",
    signedInAs: "Masuk sebagai",
  },
  career: {
    heading: "Karier",
    nextMission: "Misi berikutnya",
    funds: "Dana",
    noData: "Masuk atau mainkan misi untuk memuat data karier.",
    back: "Kembali ke menu",
  },
  armory: {
    heading: "Gudang Senjata",
    comingSoon: "Gudang senjata 3D hadir pada Fase 3.",
    back: "Kembali ke menu",
  },
  leaderboard: {
    heading: "Peringkat",
    comingSoon: "Papan peringkat hadir pada Fase 6.",
    back: "Kembali ke menu",
  },
  settings: {
    heading: "Pengaturan",
    languageHeading: "Bahasa",
    accountHeading: "Akun",
    accountNote:
      "Masuk bersifat opsional. Hanya akun yang masuk yang menyinkronkan progres dan skor ke server; tamu menyimpan semuanya di perangkat ini.",
    back: "Kembali ke menu",
  },
  common: {
    offline: "Server offline. Bermain secara lokal.",
    loading: "Memuat",
    invalidJson: "Body JSON tidak valid.",
    genericError: "Terjadi kesalahan.",
  },
};
