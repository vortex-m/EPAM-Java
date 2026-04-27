import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReduxProvider } from "@/store/provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Loan Management System",
  description: "Microfinance operations dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="theme"
          disableTransitionOnChange
        >
          <ReduxProvider>
            <QueryProvider>
              <ToastProvider>
                <div className="relative min-h-screen w-full overflow-hidden bg-fintech-surface">
                  <div className="pointer-events-none absolute inset-0 bg-fintech-glow" />
                  <main className="relative mx-auto flex min-h-screen w-full max-w-screen-2xl flex-col px-3 py-3 sm:px-5 sm:py-4">
                    {children}
                  </main>
                </div>
              </ToastProvider>
            </QueryProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
