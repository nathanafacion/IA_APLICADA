import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RecomendaBoardgame - Sistema de Recomendação de Jogos',
  description: 'Sistema de recomendação de boardgames usando TensorFlow.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <nav className="bg-primary-800 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold hover:text-primary-200 transition">
                🎲 RecomendaBoardgame
              </Link>
              <div className="flex gap-4">
                <Link href="/" className="px-4 py-2 rounded hover:bg-primary-700 transition">
                  Recomendações
                </Link>
                <Link href="/treinar" className="px-4 py-2 rounded hover:bg-primary-700 transition">
                  Treinar Modelo
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
