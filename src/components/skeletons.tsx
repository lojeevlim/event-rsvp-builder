import Link from "next/link";
import EventTabs from "@/components/EventTabs";
import { Button, GridView, Icon, Skeleton } from "@/components/ui";
import { EMAIL_KIND_HINT, EMAIL_PLACEHOLDERS } from "@/lib/email-template";

/**
 * Loading placeholders. A placeholder is drawn only for something that comes from the database or from Clerk
 * (names, numbers, links, lists, switch states); everything fixed (headings, labels, buttons, tabs, column
 * names) is the real thing, so it does not change when the data arrives. Keep each one in step with its page.
 */

const card = "rounded-3xl border border-border bg-surface";
const bar = (h: number, w: string | number = "100%", round = "rounded-md") => <Skeleton variant="rect" height={h} width={w} className={round} />;

const TONES = {
  accent: "bg-accent-100 text-accent-600 dark:bg-accent-500/20 dark:text-accent-300",
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300",
  rose: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300",
} as const;

/** A lojee-ui Stat card whose icon and label are real; only the number is a placeholder. */
export function StatShell({ label, icon, tone = "accent" }: { label: string; icon: string; tone?: keyof typeof TONES }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${TONES[tone]}`}>
        <Icon name={icon} size={18} />
      </div>
      <p className="text-sm text-fg-subtle">{label}</p>
      <div className="mt-1 flex h-8 items-center">{bar(24, 56)}</div>
    </div>
  );
}

/** The four reply counts and the reply list: the stat labels are real, the numbers and rows are placeholders. */
export function RsvpListSkeleton() {
  return (
    <div className="grid gap-5" role="status" aria-label="Loading the replies">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatShell label="Replies" icon="users" />
        <StatShell label="Can attend" icon="circle-check" tone="emerald" />
        <StatShell label="Can't attend" icon="x" tone="rose" />
        <StatShell label="People coming" icon="user" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="flex gap-6 border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-soft">
          {["Name", "Email", "Status", "Guests", "Message", "Date"].map((h) => <span key={h} className="min-w-[72px]">{h}</span>)}
        </div>
        {[0, 1, 2].map((r) => (
          <div key={r} className="flex items-center gap-6 border-b border-border px-4 py-3 last:border-0">
            {[72, 120, 64, 32, 96, 72].map((w, i) => <div key={i} className="min-w-[72px]">{bar(16, w)}</div>)}
          </div>
        ))}
      </div>
    </div>
  );
}

/** My events: the title and the grid's toolbar are real; the greeting's name and the cards are placeholders. */
export function DashboardSkeleton() {
  return (
    <div className="grid gap-6" role="status" aria-label="Loading your events">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">My events</h1>
        <p className="text-sm text-soft">
          Hi <span className="inline-block align-middle">{bar(14, 72)}</span>. Each event has its own design, link and guest replies.
        </p>
      </div>
      {/* 6 placeholder cards: never fewer than 3, and whole rows at every width (3 + 3, 2 + 2 + 2, or a single column) */}
      <GridView items={[]} loading skeletonCount={6} createLabel="New event" searchPlaceholder="Search events" minItemWidth={300} />
    </div>
  );
}

/** The event page's heading: the back link and the tabs are real; the title, status and buttons wait for the event. */
export function EventHeaderSkeleton() {
  return (
    <div className="grid gap-6">
      <div>
        <Link href="/dashboard" className="text-sm text-soft hover:text-fg">← My events</Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {bar(36, "min(22rem, 60vw)")}
            {bar(24, 48, "rounded-full")}
          </div>
          <div className="flex gap-2" aria-hidden>
            {bar(32, 124, "rounded-full")}
            {bar(32, 96, "rounded-full")}
          </div>
        </div>
      </div>
      <EventTabs />
    </div>
  );
}

/** Replies & sharing: the headings and texts are real; the link, the counts, the list and the switch are placeholders. */
export function EventBodySkeleton() {
  return (
    <div className="grid gap-8" role="status" aria-label="Loading the event">
      <section className={`grid gap-3 p-5 sm:p-6 ${card}`}>
        <div>
          <h2 className="text-lg font-extrabold">Share this event</h2>
          <p className="text-sm text-soft">Anyone with this link can see the page and reply. Send it in a chat, or email it from the Emails tab.</p>
        </div>
        {bar(44, "100%", "rounded-full")}
      </section>
      <section className="grid gap-4">
        <h2 className="text-lg font-extrabold">Replies</h2>
        <RsvpListSkeleton />
      </section>
      <section className={`grid gap-4 p-5 sm:p-6 ${card}`}>
        <h2 className="text-lg font-extrabold">Event settings</h2>
        <div className="flex items-center gap-2 text-sm text-fg-muted">
          {bar(20, 36, "rounded-full")}
          <span>Event page is live (guests can open the link and reply)</span>
        </div>
        <div className="border-t border-border pt-4">
          <Button variant="destructive-outline" size="sm" shape="pill" icon="trash-2" disabled>Delete event</Button>
          <p className="mt-2 text-xs text-soft">Deleting removes the page and every reply. This can&apos;t be undone.</p>
        </div>
      </section>
    </div>
  );
}

const fieldLabel = "block text-fg-muted text-xs font-bold uppercase tracking-wide";

/** Emails: the tabs, labels, buttons and notes are real; the saved wording and colours are placeholders. */
export function EmailsSkeleton() {
  const field = (label: string, h = 32) => (
    <div className="grid gap-1.5">
      <span className={fieldLabel}>{label}</span>
      {bar(h)}
    </div>
  );
  const color = (label: string) => (
    <div className="grid gap-1.5">
      <span className={fieldLabel}>{label}</span>
      <div className="flex items-center gap-2">
        {bar(40, 40, "rounded-lg")}
        {bar(40, 112)}
      </div>
    </div>
  );
  return (
    <div className="grid gap-8" role="status" aria-label="Loading the emails">
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-accent-600 px-4 py-2 text-sm font-semibold text-white">Invitation</span>
          <span className="rounded-full bg-surface-muted px-4 py-2 text-sm font-semibold text-fg-muted">RSVP confirmation</span>
        </div>
        <p className="text-sm text-soft">{EMAIL_KIND_HINT.invitation}</p>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className={`grid gap-4 p-8 ${card}`}>
          {field("Subject")}
          {field("Heading (small text on the colour band)")}
          {field("Message", 80)}
          {field("Button label (empty = no button)")}
          <div className="grid gap-4 sm:grid-cols-2">{color("Band & button colour")}{color("Background colour")}</div>
          {field("Footer")}
          <p className="text-xs text-soft">
            Fill-in words: {EMAIL_PLACEHOLDERS.map((p) => <code key={p} className="mr-1.5 rounded bg-surface-muted px-1">{p}</code>)}— replaced for each guest.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button shape="pill" size="sm" disabled>Save</Button>
            <Button shape="pill" size="sm" variant="outline" disabled>Send a test to me</Button>
          </div>
        </div>
        <div className="grid gap-2">
          <p className={fieldLabel}>Preview</p>
          {bar(36, "100%", "rounded-2xl")}
          <Skeleton variant="rect" height={520} className="rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

/** Profile: the stat labels and the settings heading are real; the person, the values and Clerk's panel are placeholders. */
export function ProfileSkeleton() {
  return (
    <div className="grid gap-6" role="status" aria-label="Loading your profile">
      <div className="flex items-center gap-4">
        <Skeleton variant="circle" size={64} />
        <div className="grid gap-2">
          {bar(30, 200)}
          {bar(18, 160)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatShell label="Role" icon="shield-check" />
        <StatShell label="Member since" icon="calendar" />
        <StatShell label="Events" icon="calendar-days" />
        <StatShell label="Replies received" icon="inbox" />
      </div>
      <section className="grid gap-3">
        <h2 className="text-lg font-extrabold">Account settings</h2>
        <p className="text-sm text-soft">Change your name, photo, email, password and sign-in methods.</p>
        <Skeleton variant="rect" height={420} className="rounded-2xl" />
      </section>
    </div>
  );
}

const th = "px-4 py-3";

/** Super admin: the title, stat labels, search box and table headings are real; the numbers and rows are placeholders. */
export function SuperSkeleton() {
  const table = (min: string, heads: string[], cells: (string | number)[], rows: number) => (
    <div className="overflow-x-auto rounded-3xl border border-border bg-surface">
      <table className={`w-full ${min} text-left text-sm`}>
        <thead className="border-b border-border text-xs uppercase tracking-wide text-soft">
          <tr>{heads.map((h) => <th key={h} className={th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-b border-border last:border-0">
              {cells.map((w, i) => <td key={i} className={th}>{bar(16, w)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  return (
    <div className="grid gap-8" role="status" aria-label="Loading the super admin page">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Super admin</h1>
        <p className="text-sm text-soft">Everyone who has registered, every event, and the totals across the platform.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatShell label="Users" icon="users" />
        <StatShell label="Events" icon="calendar-days" />
        <StatShell label="Replies" icon="inbox" />
        <StatShell label="Can attend" icon="circle-check" tone="emerald" />
        <StatShell label="Can't attend" icon="x" tone="rose" />
        <StatShell label="People coming" icon="user" />
      </div>
      <div className="grid gap-10">
        <section className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold">Registered users</h2>
            <input disabled placeholder="Search name or email" aria-label="Search users" className="w-full rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none sm:w-72" />
          </div>
          {table("min-w-[760px]", ["User", "Role", "Events", "Replies", "Joined", "Last seen", "Enabled"], [140, 72, 32, 32, 80, 80, 40], 4)}
          <p className="text-xs text-soft">Disabling a user signs them out of the app and hides all their event pages. Enabling brings everything back.</p>
        </section>
        <section className="grid gap-3">
          <h2 className="text-lg font-extrabold">All events</h2>
          {table("min-w-[860px]", ["Event", "Host", "Can attend", "Can't", "People", "Created", "Visible", ""], [140, 120, 32, 32, 32, 80, 40, 56], 3)}
        </section>
      </div>
    </div>
  );
}

/** The design editor loads its whole canvas from the event, so this stands in for the editor's panels. */
export function EditorSkeleton() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface-muted" role="status" aria-label="Loading the editor">
      <div className="flex items-center gap-3 border-b border-border bg-surface px-5 py-3">
        {bar(36, 220, "rounded-full")}
        {bar(36, 220, "rounded-full")}
        <div className="ml-auto flex items-center gap-2">
          {bar(32, 32)}
          {bar(32, 32)}
          <Skeleton variant="circle" size={32} />
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-hidden p-6 lg:pt-2">
          <div className="mx-auto mb-3 flex max-w-[1100px] justify-between">
            {bar(44, 232, "rounded-full")}
            {bar(44, 148, "rounded-full")}
          </div>
          <div className="mx-auto grid max-w-[1100px] gap-4 rounded-2xl border border-border bg-surface p-10">
            {bar(28, 160, "rounded-full")}
            {bar(64, "70%")}
            {bar(64, "55%")}
            {bar(24, "80%")}
            {bar(48, 220, "rounded-full")}
          </div>
        </div>
        <div className="hidden w-[176px] shrink-0 border-l border-border bg-surface p-3 lg:grid lg:content-start lg:gap-3">
          {bar(34, 140, "rounded-full")}
          {[0, 1, 2, 3, 4].map((i) => <div key={i}>{bar(48, "100%", "rounded-xl")}</div>)}
        </div>
        <div className="hidden w-[84px] shrink-0 border-l border-border bg-surface p-2 lg:grid lg:content-start lg:gap-2">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <div key={i} className="flex justify-center">{bar(58, 64, "rounded-xl")}</div>)}
        </div>
      </div>
    </div>
  );
}

/** A guest's event page: all of it is the host's design, so all of it is a placeholder. */
export function PublicEventSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-3xl justify-items-center gap-5 px-4 py-16 text-center" role="status" aria-label="Loading the event">
      {bar(32, 160, "rounded-full")}
      {bar(56, "min(34rem, 90%)")}
      {bar(56, "min(26rem, 70%)")}
      {bar(24, "min(30rem, 85%)")}
      {bar(48, 200, "rounded-full")}
      <div className="mt-8 grid w-full grid-cols-4 gap-2 sm:gap-3">
        {[0, 1, 2, 3].map((i) => <div key={i}>{bar(88, "100%", "rounded-2xl")}</div>)}
      </div>
    </div>
  );
}
