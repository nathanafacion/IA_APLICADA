import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Truco Game",
  description: "Jogo de Truco Brasileiro - Single Player vs IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
