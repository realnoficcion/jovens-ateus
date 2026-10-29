import type { Metadata } from "next";
import "./globals.css";
import { LocaleProvider } from "@/components/locale-provider";

export const metadata: Metadata = {
  title: "jovens ateus",
  description: "jovens ateus — brazilian band. são paulo, est. 2021.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
