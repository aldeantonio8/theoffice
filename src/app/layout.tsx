import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Office — Portfólio 3D Interativo",
  description: "Entre num escritório virtual interativo e descubra a empresa através dos seus departamentos.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}
