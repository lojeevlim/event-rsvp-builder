import { Fragment, type ReactNode } from "react";
import { GripVertical, Keyboard, Layers, MapPin, Plus, Redo2, Sparkles, Undo2, Wrench } from "lucide-react";
import BackLink from "@/components/BackLink";
import EventTabs from "@/components/EventTabs";
import { Button, ButtonGroup, GridView, Icon, SegmentButton, Skeleton } from "@/components/ui";
import { elementMeta, GROUPS } from "@/components/palette";
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
        <BackLink href="/dashboard">My events</BackLink>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
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

/** A placeholder of an exact size: `cls` carries the (responsive) height, `w` the width. */
const slot = (cls: string, w: string, round = "rounded-md") => (
  <div className={cls} style={{ width: w, maxWidth: "100%" }}>
    <Skeleton variant="rect" height="100%" width="100%" className={round} />
  </div>
);

/** A section of the page as PageView draws it: same padding, same centred max-w-3xl column (max-w-6xl when wide), same gaps; `card` gives the rounded, bordered card. */
function PageSec({ pad, bg = "", card = false, wide = false, live = false, children }: { pad: "md" | "lg"; bg?: string; card?: boolean; wide?: boolean; live?: boolean; children: ReactNode }) {
  const body = (
    <section className={`relative ${bg} ${pad === "lg" ? "py-16 md:py-20" : "py-12 md:py-16"} px-4`}>
      <div className={`mx-auto flex flex-col items-center gap-4 text-center md:gap-5 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
        {Array.isArray(children) ? children.map((c, i) => <div key={i} className="flex w-full flex-col items-center">{c}</div>) : children}
      </div>
    </section>
  );
  if (!card) return body;
  // the live page's card is a little tighter and less round on phones than the editor's
  return <div className={`mx-auto max-w-7xl overflow-hidden border border-border shadow-[0_10px_28px_-18px_rgba(0,0,0,0.25)] ${live ? "my-5 w-[calc(100%-1rem)] rounded-[32px] md:my-8 md:w-[calc(100%-1.5rem)] md:rounded-[64px]" : "my-8 w-[calc(100%-1.5rem)] rounded-[64px]"}`}>{body}</div>;
}

/** The standard page, section by section (hero, countdown, details, map, agenda, gallery, RSVP, footer) — shared by the editor and the live page skeletons. */
function PageSections({ live = false }: { live?: boolean }) {
  return (
    <>
    <PageSec live={live} card pad="lg">
      {slot("h-[34px]", "10rem", "rounded-full")}
      {slot("h-[38px] sm:h-[50px] md:h-[76px]", "min(100%, 30rem)")}
      {slot("h-[38px] sm:h-[50px] md:h-[76px]", "min(100%, 22rem)")}
      {slot("h-8", "16rem")}
      {slot("h-7", "min(100%, 36rem)")}
      {slot("h-11", "11rem", "rounded-full")}
    </PageSec>
    <PageSec live={live} pad="md" bg="bg-surface-muted">
      <div className="w-full">
        <div className="flex items-center justify-center gap-3 sm:gap-5">
          <span aria-hidden className="h-px max-w-20 flex-1 bg-border" />
          {slot("h-5 sm:h-6 md:h-7", "min(60%, 18rem)")}
          <span aria-hidden className="h-px max-w-20 flex-1 bg-border" />
        </div>
        <div className="mx-auto mt-5 grid max-w-3xl grid-cols-4 gap-2 sm:mt-7 sm:gap-3 md:gap-5">
          {[0, 1, 2, 3].map((i) => <div key={i}>{slot("h-[80px] sm:h-[84px] md:h-[92px]", "100%", "rounded-2xl")}</div>)}
        </div>
      </div>
    </PageSec>
    <PageSec live={live} pad="lg">
      {slot("h-[25px] sm:h-[31px] md:h-[38px]", "min(100%, 20rem)")}
      {slot("h-7", "min(100%, 28rem)")}
      <div className="mt-2 flex w-full flex-col gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="grid w-full justify-items-center rounded-[28px] border border-border p-5 sm:p-8">
            <Skeleton variant="circle" size={40} />
            {slot("mt-3 h-7 sm:h-8", "7rem")}
            {slot("mt-3 h-7", "min(100%, 13rem)")}
            {slot("h-6", "min(100%, 15rem)")}
          </div>
        ))}
      </div>
    </PageSec>
    <PageSec live={live} pad="lg" bg="bg-surface-muted">
      {slot("h-[25px] sm:h-[31px] md:h-[38px]", "10rem")}
      {slot("h-7", "min(100%, 28rem)")}
      <div className="w-full">{slot("h-[320px]", "100%", "rounded-3xl")}</div>
    </PageSec>
    <PageSec live={live} pad="lg" bg="bg-surface-muted">
      {slot("h-[30px]", "8rem", "rounded-full")}
      {slot("h-[25px] sm:h-[31px] md:h-[38px]", "min(100%, 18rem)")}
      <div className="relative mt-4 flex w-full flex-col gap-5 border-l border-dashed border-border pl-6 sm:pl-10 md:gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="relative grid w-full gap-1 rounded-3xl border border-border bg-surface p-5 text-left">
            <span className="absolute -left-[2.25rem] top-6 h-5 w-5 rounded-full bg-border ring-4 ring-surface-muted sm:-left-[3.25rem]" />
            {slot("h-[22px]", "5rem", "rounded-full")}
            {slot("mt-1 h-7", "min(100%, 12rem)")}
            {slot("mt-1 h-6", "min(100%, 22rem)")}
          </div>
        ))}
      </div>
    </PageSec>
    <PageSec live={live} pad="lg" wide>
      {slot("h-[25px] sm:h-[31px] md:h-[38px]", "min(100%, 14rem)")}
      {slot("h-7", "min(100%, 26rem)")}
      <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="aspect-square">{slot("h-full", "100%", "rounded-xl")}</div>)}
      </div>
    </PageSec>
    <PageSec live={live} pad="lg" bg="bg-surface-muted">
      <div className="w-full max-w-2xl text-left">
        <div className="rounded-[28px] border border-border bg-surface p-4 sm:p-10">
          <div className="px-1 py-1 sm:px-3">
            <div className="mb-9 grid justify-items-center">
              {slot("h-9 md:h-10", "min(100%, 16rem)")}
              {slot("mt-3 h-6", "min(100%, 24rem)")}
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-7">
              {[0, 1].map((i) => (
                <div key={i} className="col-span-2 grid gap-2">
                  {slot("h-4", "6rem")}
                  {slot("h-12", "100%", "rounded-xl")}
                </div>
              ))}
              <div className="col-span-2 grid gap-3">
                {slot("h-4", "9rem")}
                <div className="grid gap-3 sm:grid-cols-2">
                  {[0, 1].map((i) => <div key={i}>{slot("h-[76px]", "100%", "rounded-2xl")}</div>)}
                </div>
              </div>
              <div className="col-span-2 grid gap-2">
                {slot("h-4", "7rem")}
                {slot("h-[100px]", "100%", "rounded-xl")}
              </div>
              <div className="col-span-2">{slot("h-12", "100%", "rounded-full")}</div>
            </div>
          </div>
        </div>
      </div>
    </PageSec>
    <PageSec live={live} card pad="md" bg="bg-surface-muted">
      {slot("h-[25px]", "min(100%, 12rem)")}
      {slot("h-6", "min(100%, 22rem)")}
    </PageSec>
    </>
  );
}

/** The editor: the real header labels, buttons, panel headings and tool icons; names, titles and the page itself are placeholders. Mirrors AdminPanel's layout piece for piece. */
export function EditorSkeleton() {
  const ghost = "pointer-events-none";
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface-muted text-fg" role="status" aria-label="Loading the editor">
      <header className="flex flex-wrap items-center gap-2 border-b border-border bg-surface px-3 py-2 text-xs sm:gap-3 sm:px-5 sm:py-3">
        <div className="mr-1 flex min-w-0 items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-1 text-xs font-semibold shadow-sm sm:mr-3 sm:pr-3.5 sm:text-sm">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-600 text-white">
            <Icon name="arrow-left" size={15} />
          </span>
          <span className="max-sm:hidden">{bar(14, 112)}</span>
          <span className="font-normal text-soft max-sm:hidden">· Design</span>
        </div>
        <ButtonGroup shape="pill" className={ghost}>
          <SegmentButton active icon="palette">Edit page</SegmentButton>
          <SegmentButton active={false} icon="users">RSVPs</SegmentButton>
        </ButtonGroup>
        <div className="ml-auto flex items-center gap-2 max-sm:hidden">
          <Button variant="ghost" size="sm" className="px-2" aria-label="Undo" disabled><Undo2 size={16} /></Button>
          <Button variant="ghost" size="sm" className="px-2" aria-label="Redo" disabled><Redo2 size={16} /></Button>
          <Button variant="ghost" size="sm" className="px-2" aria-label="Keyboard shortcuts" disabled><Keyboard size={16} /></Button>
          <Skeleton variant="circle" size={32} />
        </div>
        <div className="ml-auto sm:hidden">
          <Skeleton variant="circle" size={32} />
        </div>
        <div className="flex w-full items-center gap-2 lg:hidden">
          <Button size="sm" shape="pill" icon="calendar-days" disabled className="font-semibold">Event &amp; theme</Button>
          <Button size="sm" shape="pill" icon="eye" disabled className="font-semibold">Preview</Button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden bg-surface-muted p-6 lg:pt-2">
          <div className="mx-auto mb-3 hidden max-w-[1100px] justify-between lg:flex">
            <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1.5 shadow-md">
              <Button size="sm" shape="pill" icon="calendar-days" disabled className="font-semibold">Event &amp; theme</Button>
              <Button size="sm" shape="pill" icon="eye" disabled className="font-semibold">Preview</Button>
            </div>
          </div>
          {/* the page, in the editor's left gutter: the standard page, section by section, with the real paddings, widths, gaps and element heights */}
          <div className="mx-auto max-w-[1100px] overflow-hidden rounded-2xl bg-surface pt-1 ring-1 ring-border">
            <main className="flow-root pl-12">
              <PageSections />
            </main>
          </div>
        </div>
        {/* what is in the selected section: the Save button and group headings are real, the rows are placeholders */}
        <aside className="max-h-56 w-full shrink-0 overflow-hidden border-t border-border bg-surface lg:max-h-none lg:w-[clamp(176px,14vw,300px)] lg:border-l lg:border-t-0">
          <div className="flex h-14 w-full shrink-0 items-center gap-2 border-b border-border bg-surface px-3 lg:h-[65px]">
            <Button shape="pill" color="emerald" icon="check" disabled className="min-w-0 flex-1 font-semibold">All saved</Button>
          </div>
          <div className="p-3">
            <span className="mb-2 inline-flex w-fit max-w-full items-center gap-2 rounded-full bg-ink px-3.5 py-1 text-sm font-bold text-white shadow-sm">
              <span className="h-2 w-2 shrink-0 rounded-full bg-white" />
              <span className="truncate">Content</span>
            </span>
            <div className="grid gap-2 lg:gap-3">
              {[
                { label: "Components", GroupIcon: Layers, rows: 6, grip: true },
                { label: "Stickers", GroupIcon: Sparkles, rows: 3, grip: false },
              ].map(({ label, GroupIcon, rows, grip }) => (
                <div key={label} className="grid gap-1">
                  <p className="flex w-full items-center gap-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-soft">
                    <GroupIcon size={13} />
                    <span className="flex-1">{label}</span>
                    {slot("h-[14px]", "1.25rem", "rounded")}
                  </p>
                  {Array.from({ length: rows }, (_, i) => (
                    <div key={i} className="flex items-center gap-2.5 rounded-xl border border-transparent px-2 py-2">
                      {grip && <span className="px-1 text-soft"><GripVertical size={18} /></span>}
                      <div className="grid min-w-0 flex-1 gap-0.5">
                        {slot("h-[14px]", "3.5rem", "rounded")}
                        {slot("h-4", "min(100%, 7rem)")}
                      </div>
                      <span className="h-9 w-9 shrink-0 lg:h-7 lg:w-7" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </aside>
        {/* the toolbox: its icons and labels are real */}
        <aside className="max-h-24 w-full shrink-0 overflow-hidden border-t border-border bg-surface lg:flex lg:max-h-none lg:w-[84px] lg:flex-col lg:border-l lg:border-t-0">
          <div className="hidden h-[65px] shrink-0 flex-col items-center justify-center gap-1.5 border-b border-border bg-gradient-to-b from-surface-muted to-surface px-2 lg:flex">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-fg text-surface shadow-sm"><Wrench size={12} /></span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fg">Toolbox</p>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto p-2 lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-hidden lg:py-3">
            {GROUPS.map((g, i) => (
              <Fragment key={g.title}>
                {i > 0 && <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-border lg:mx-0 lg:my-1 lg:h-px lg:w-6" />}
                {g.types.map((t) => {
                  const { Icon: Tool, label } = elementMeta(t);
                  return <Tile key={t} label={label} icon={<Tool size={19} strokeWidth={1.75} />} />;
                })}
              </Fragment>
            ))}
            <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-border lg:mx-0 lg:my-1 lg:h-px lg:w-6" />
            <Tile label="Text stickers" icon={<Sparkles size={19} strokeWidth={1.75} />} />
            <Tile label="New section" icon={<Plus size={19} strokeWidth={1.75} />} />
            <Tile label="New map" icon={<MapPin size={19} strokeWidth={1.75} />} />
          </div>
        </aside>
      </div>
    </div>
  );
}

/** A toolbox button as the editor draws it (icon over label), not clickable. */
function Tile({ label, icon }: { label: string; icon: ReactNode }) {
  return (
    <span className="flex min-h-[3.6rem] w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-surface-muted px-1 py-2 text-soft">
      {icon}
      <span className="text-center text-[10px] font-medium leading-tight">{label}</span>
    </span>
  );
}

/** The live event page: the same sections as the editor's preview (without its left gutter), as PageView lays them out. */
export function PublicEventSkeleton() {
  return (
    <main className="flow-root min-h-screen bg-surface" role="status" aria-label="Loading the event">
      <PageSections live />
    </main>
  );
}
