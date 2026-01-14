import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hololive Schedule | Premium Viewer",
  description: "A stunning, high-performance schedule viewer for Hololive Production.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
