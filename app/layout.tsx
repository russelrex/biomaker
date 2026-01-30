import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/src/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Biomarker Dashboard",
  description: "View and analyze your health biomarkers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
        {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
