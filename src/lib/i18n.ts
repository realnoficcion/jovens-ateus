export type Locale = "pt" | "en";

export const LOCALES: Locale[] = ["pt", "en"];
export const DEFAULT_LOCALE: Locale = "pt";

export interface Dict {
  title: {
    line1: string;
    line2: string;
    line3: string;
  };
  subtitle: string;
  siteDesc: string;
  labels: {
    year: string;
    place: string;
    date: string;
    members: string;
    release: string;
    archive: string;
  };
  loading: string;
  manifesto: string;
  bioShort: string;
  store: string;
  storeDesc: string;
  buy: string;
  soldOut: string;
  tickets: string;
  contact: string;
  booking: string;
  press: string;
  general: string;
  follow: string;
  instructions: string;
  years: string;
}

export const dict: Record<Locale, Dict> = {
  pt: {
    title: {
      line1: "JO V ENS",
      line2: "A T EUS",
      line3: "ARQUIVO · 2021—",
    },
    subtitle: "banda · são paulo · brasil",
    siteDesc:
      "este é um arquivo visual da banda jovens ateus. navegue arrastando, use a roda do mouse para dar zoom.",
    labels: {
      year: "Ano",
      place: "Local",
      date: "Data",
      members: "Integrantes",
      release: "Disco",
      archive: "Arquivo",
    },
    loading: "CARREGANDO",
    manifesto:
      "não há deuses. há som. há palco molhado. há feedback. há a cidade girando lá fora enquanto a gente toca. isso basta.",
    bioShort:
      "quatro corpos, um barulho, uma cidade. pós-punk e ruído em português. dois discos. muitos shows. nenhuma crença.",
    store: "LOJA",
    storeDesc: "vinis, cds, digital. envio pro brasil inteiro.",
    buy: "comprar",
    soldOut: "esgotado",
    tickets: "ingresso",
    contact: "CONTATO",
    booking: "shows & booking",
    press: "imprensa",
    general: "geral",
    follow: "siga",
    instructions: "arraste para navegar · scroll para zoom",
    years: "Anos",
  },
  en: {
    title: {
      line1: "JO V ENS",
      line2: "A T EUS",
      line3: "ARCHIVE · 2021—",
    },
    subtitle: "band · são paulo · brazil",
    siteDesc:
      "this is a visual archive of the band jovens ateus. drag to navigate, scroll to zoom.",
    labels: {
      year: "Year",
      place: "Place",
      date: "Date",
      members: "Members",
      release: "Release",
      archive: "Archive",
    },
    loading: "LOADING",
    manifesto:
      "no gods. only sound. only a wet stage. only feedback. only the city spinning outside while we play. that's enough.",
    bioShort:
      "four bodies, one noise, one city. post-punk and noise in portuguese. two albums. many shows. no beliefs.",
    store: "STORE",
    storeDesc: "vinyl, cds, digital. ships worldwide.",
    buy: "buy",
    soldOut: "sold out",
    tickets: "ticket",
    contact: "CONTACT",
    booking: "shows & booking",
    press: "press",
    general: "general",
    follow: "follow",
    instructions: "drag to navigate · scroll to zoom",
    years: "Years",
  },
};
