import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Office — Interactive 3D Portfolio",
  description: "Step inside an interactive virtual office and explore the company through its departments.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
