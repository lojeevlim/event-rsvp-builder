import type { Metadata } from "next";
import { Nunito, Fredoka, Chewy } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { getSettings } from "@/lib/settings";

const sans = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
});

const comic = Chewy({
  weight: "400",
  variable: "--font-accent",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const name = (await getSettings()).name || "RSVP";
  return { title: name === "RSVP" ? "RSVP" : `${name} — RSVP`, description: `RSVP for ${name}` };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { theme } = await getSettings();
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${comic.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><Providers theme={theme}>{children}</Providers></body>
    </html>
  );
}
