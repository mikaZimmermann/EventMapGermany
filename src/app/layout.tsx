import "leaflet/dist/leaflet.css";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EventMap Germany",
  description: "Leaflet + Supabase event map starter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
