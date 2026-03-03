import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '医療従事者向け調査ビルダー',
  description: '簡易調査画面ビルダー',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
