import type { Metadata } from "next";
import Link from "next/link";
import TermsContent from "@/components/TermsContent";

export const metadata: Metadata = { title: "Terms and conditions" };

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-extrabold">Terms and conditions</h1>
      <div className="mt-6"><TermsContent /></div>
      <Link href="/" className="mt-8 inline-block text-sm font-bold text-brand">← Back to home</Link>
    </main>
  );
}
