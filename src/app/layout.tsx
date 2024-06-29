import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "栗林健太郎",
  description: "作家・栗林健太郎のWebサイト",
  icons: {
    icon: 'https://pbs.twimg.com/profile_images/1737743542724997120/ygmW433p_400x400.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
