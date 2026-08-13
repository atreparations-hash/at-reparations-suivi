import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AT Réparations - Suivi de réparation",
  description: "Suivez en temps réel l'état de votre appareil chez AT Réparations à Brétignolles-sur-Mer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
