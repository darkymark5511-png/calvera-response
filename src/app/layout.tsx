import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calvera Response",
  description: "Calvera Bay Tactical Response Unit — tactical operations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
