import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creative PM — 制作物管理",
  description: "社内マーケ部門の販促物管理アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-bold text-lg tracking-tight">
                🎨 Creative PM
              </Link>
              <nav className="flex gap-4 text-sm text-gray-600">
                <Link href="/" className="hover:text-gray-900">
                  ボード
                </Link>
                <Link href="/list" className="hover:text-gray-900">
                  一覧
                </Link>
              </nav>
            </div>
            <Link
              href="/items/new"
              className="bg-gray-900 text-white text-sm px-3 py-1.5 rounded-md hover:bg-gray-700"
            >
              + 新規制作物
            </Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
