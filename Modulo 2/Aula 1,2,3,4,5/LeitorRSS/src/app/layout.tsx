import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leitor RSS",
  description: "Leitor de RSS inteligente com IA - LangGraph e Ollama",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
