export type Show = {
  date: string;
  city: string;
  venue: string;
  country: string;
  ticketUrl?: string;
  soldOut?: boolean;
};

export type Release = {
  id: string;
  title: string;
  year: string;
  cover: string;
  tracks: string[];
  formats: Array<"vinyl" | "cd" | "digital">;
  price: Record<"vinyl" | "cd" | "digital", string | null>;
  buyUrl: string;
  soldOut?: boolean;
};

export const upcomingShows: Show[] = [
  {
    date: "2026-11-14",
    city: "São Paulo",
    country: "BR",
    venue: "Audio Rebel",
    ticketUrl: "https://example.com",
  },
  {
    date: "2026-11-29",
    city: "Rio de Janeiro",
    country: "BR",
    venue: "Fundição Progresso",
    ticketUrl: "https://example.com",
  },
  {
    date: "2026-12-13",
    city: "Belo Horizonte",
    country: "BR",
    venue: "Autêntica",
    soldOut: true,
  },
  {
    date: "2027-01-24",
    city: "Curitiba",
    country: "BR",
    venue: "Hangar 110",
    ticketUrl: "https://example.com",
  },
];

export const pastShows: Show[] = [
  { date: "2026-10-04", city: "São Paulo", country: "BR", venue: "Sesc Pompeia" },
  { date: "2026-09-21", city: "Porto Alegre", country: "BR", venue: "Opinião" },
  { date: "2026-08-30", city: "Recife", country: "BR", venue: "Clube AABB" },
  { date: "2026-08-16", city: "Salvador", country: "BR", venue: "Teatro Vila Velha" },
  { date: "2026-07-19", city: "São Paulo", country: "BR", venue: "Carioca Club" },
  { date: "2026-06-28", city: "Buenos Aires", country: "AR", venue: "Club Niceto" },
  { date: "2026-05-11", city: "Lisboa", country: "PT", venue: "Musicbox" },
  { date: "2026-04-05", city: "São Paulo", country: "BR", venue: "Cine Joia" },
  { date: "2026-03-22", city: "Belo Horizonte", country: "BR", venue: "Autêntica" },
  { date: "2026-02-14", city: "Rio de Janeiro", country: "BR", venue: "Circo Voador" },
  { date: "2025-12-07", city: "Florianópolis", country: "BR", venue: "John Bull Pub" },
  { date: "2025-11-19", city: "São Paulo", country: "BR", venue: "Sesc Vila Mariana" },
];

export const releases: Release[] = [
  {
    id: "deus-nenhum",
    title: "DEUS NENHUM",
    year: "2025",
    cover: "/assets/disco1.jpg",
    tracks: [
      "abertura (ruído branco)",
      "deus nenhum",
      "igreja fechada",
      "não há perdão",
      "manifesto 2:12am",
      "cão sagrado",
      "nada do que é humano",
      "última hora",
    ],
    formats: ["vinyl", "cd", "digital"],
    price: { vinyl: "R$ 180", cd: "R$ 60", digital: "R$ 25" },
    buyUrl: "https://jovensateus.bandcamp.com",
  },
  {
    id: "primeiro-grito",
    title: "PRIMEIRO GRITO",
    year: "2022",
    cover: "/assets/disco2.jpg",
    tracks: [
      "primeiro grito",
      "cidade cinza",
      "sem fé",
      "amanhã é feriado",
      "ninguém escuta",
      "fim de semana",
    ],
    formats: ["cd", "digital"],
    price: { vinyl: null, cd: "R$ 50", digital: "R$ 20" },
    buyUrl: "https://jovensateus.bandcamp.com",
    soldOut: false,
  },
];

export const members = [
  { name: "ALICE MONTEIRO", role: "voz & guitarra" },
  { name: "GUSTAVO SÁ", role: "baixo" },
  { name: "RENATA KOBAYASHI", role: "bateria" },
  { name: "DIEGO FURTADO", role: "guitarra & synth" },
];

export const pressQuotes = [
  {
    quote: "o barulho mais interessante que saiu de são paulo nos últimos anos.",
    source: "NOIZE",
  },
  {
    quote: "jovens ateus provam que o post-punk brasileiro está vivo e sangrando.",
    source: "SCREAM & YELL",
  },
  {
    quote: "um disco que não pede licença.",
    source: "MONKEYBUZZ",
  },
];

export const socials = [
  { label: "INSTAGRAM", url: "https://instagram.com/jovensateus" },
  { label: "BANDCAMP", url: "https://jovensateus.bandcamp.com" },
  { label: "SPOTIFY", url: "https://open.spotify.com" },
  { label: "YOUTUBE", url: "https://youtube.com" },
];
