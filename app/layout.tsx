import "./globals.css";
import type { Metadata } from "next";
import ThemeProvider from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Ekokimya SetMind",
  description: "Internal SaaS workspace",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="bg-white text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
