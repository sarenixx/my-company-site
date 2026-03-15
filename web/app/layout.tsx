import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Advance Venture Partners",
  description:
    "Advance Venture Partners combines the disciplined approach of institutional venture and growth equity investing with strategic insights and long-term partnership.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
