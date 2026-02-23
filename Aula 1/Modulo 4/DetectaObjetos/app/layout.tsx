import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Detector de Objetos - YOLOv5 + TensorFlow.js",
  description: "Detecção de objetos em vídeo usando YOLOv5 e Web Workers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
