import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "./contexts/ThemeContext";
import { AppSidebar } from "./components/sidebar/AppSidebar";
import { Toaster } from "./components/ui/toast";

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
      <ThemeProvider>
        <body className="antialiased font-sans bg-background text-foreground">
          <div className="flex h-screen">
            <AppSidebar />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
          <Toaster />
        </body>
      </ThemeProvider>
    </html>
  );
}
