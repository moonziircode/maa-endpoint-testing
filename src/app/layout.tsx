import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anteraja MAA - Mitra Agent Portal",
  description: "Web client replikasi workflow bisnis Anteraja MAA Android",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
