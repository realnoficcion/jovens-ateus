import type { Locale } from "./i18n";

export function formatShowDate(iso: string, locale: Locale): string {
  const d = new Date(iso + "T20:00:00");
  const dd = String(d.getDate()).padStart(2, "0");
  const monthsPt = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
  const monthsEn = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const mm = (locale === "pt" ? monthsPt : monthsEn)[d.getMonth()];
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}·${mm}·${yy}`;
}

export function dayOfWeek(iso: string, locale: Locale): string {
  const d = new Date(iso + "T20:00:00");
  const pt = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  const en = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return (locale === "pt" ? pt : en)[d.getDay()];
}
