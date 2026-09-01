import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { CurrentUserProvider } from "@/lib/current-user-context";
import BottomNav from "@/components/BottomNav";
import UserGate from "@/components/UserGate";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "flick.",
  description: "Dois usuários. Um histórico. Mil filmes para assistir.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${display.variable} ${body.variable} font-[var(--font-body)] film-grain`}
      >
        <CurrentUserProvider>
          <UserGate>
            <div className="pb-24">{children}</div>
            <BottomNav />
          </UserGate>
        </CurrentUserProvider>
      </body>
    </html>
  );
}
