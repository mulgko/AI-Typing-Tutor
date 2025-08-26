import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 타이핑 튜터",
  description: "AI 기반 타이핑 연습 프로그램",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
