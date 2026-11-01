import type { Metadata } from "next";
import { Nunito, Fredoka, Chewy, Inter, Poppins, Lora, Playfair_Display, DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

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

// alternative font pairings for the "Font style" setting; not preloaded, so they only download when a page uses them
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], preload: false });
const poppins = Poppins({ variable: "--font-poppins", weight: ["600", "700"], subsets: ["latin"], preload: false });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"], preload: false });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], preload: false });
const dmSans = DM_Sans({ variable: "--font-dmsans", subsets: ["latin"], preload: false });
const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"], preload: false });

export const metadata: Metadata = {
  title: { default: "Event RSVP — beautiful invitations, one link", template: "%s · Event RSVP" },
  description: "Design an invitation, share one link, and see who can come.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${comic.variable} ${display.variable} ${inter.variable} ${poppins.variable} ${lora.variable} ${playfair.variable} ${dmSans.variable} ${grotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><Providers>{children}</Providers></body>
    </html>
  );
}
