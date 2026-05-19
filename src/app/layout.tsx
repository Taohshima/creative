import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { IconBoard, IconList, IconPlus, IconLayers } from "@/components/Icons";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Creative管理 — 制作物管理",
  description: "社内マーケ部門の販促物を、進行ステータスとタスクで管理するアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={inter.variable}>
      <body
        className="min-h-screen"
        style={{
          fontFamily:
            "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Yu Gothic Medium', system-ui, sans-serif",
        }}
      >
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-zinc-100">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 mr-2">
              <span className="relative grid place-items-center w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-500 text-white shadow-sm">
                <IconLayers size={15} />
              </span>
              <span className="font-semibold tracking-tight text-[15px]">
                Creative管理
              </span>
            </Link>

            <nav className="flex items-center gap-1">
              <Link href="/" className="nav-link inline-flex items-center gap-1.5">
                <IconBoard size={14} />
                ボード
              </Link>
              <Link
                href="/list"
                className="nav-link inline-flex items-center gap-1.5"
              >
                <IconList size={14} />
                一覧
              </Link>
            </nav>

            <div className="flex-1" />

            <Link href="/items/new" className="btn-primary">
              <IconPlus size={14} />
              新規制作物
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8 animate-in">
          {children}
        </main>

        <footer className="max-w-7xl mx-auto px-6 py-10 text-xs text-zinc-400">
          Creative管理 · 制作物を、まとめて、進める。
        </footer>
      </body>
    </html>
  );
}
