import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { WalletProvider } from "@/context/WalletContext";

export const metadata: Metadata = {
  title: "TradeTrust | Verified Business Credentials. Privacy-First Financing. AI Commerce.",
  description:
    "Helping local shopkeepers and small merchants access working-capital financing on Base Sepolia using zero-knowledge privacy proofs and authorized AI agentic commerce.",
  keywords: ["Fintech", "Base Sepolia", "Zcash Privacy Track", "Bitrefill", "Agentic Commerce", "Working Capital"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('tradetrust_theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (saved === 'light' || (!saved && !prefersDark)) {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.remove('light');
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-mint selection:text-black">
        <ThemeProvider>
          <WalletProvider>
            {children}
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
