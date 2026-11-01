import Link from "next/link";

export default function EventNotFound() {
  return (
    <main className="mx-auto mt-28 max-w-md px-4 text-center">
      <h1 className="text-2xl font-extrabold">This event isn&apos;t available</h1>
      <p className="mt-2 text-sm text-soft">The link may be wrong, or the host has hidden the page. Ask them for a new link.</p>
      <Link href="/" className="mt-6 inline-block text-sm font-semibold text-accent-600 hover:underline">Event RSVP</Link>
    </main>
  );
}
