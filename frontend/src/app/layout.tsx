import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";

export const metadata: Metadata = {
  title: "Marrakech Access — Conciergerie de luxe",
  description: "Villas, riads et expériences sur mesure à Marrakech. Votre Majordome IA organise tout.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <Header />
        {children}
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}