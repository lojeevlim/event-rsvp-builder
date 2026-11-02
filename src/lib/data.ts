import { randomBytes } from "crypto";
import { ensureSchema, sql, type Row } from "./db";
import { normalizeTemplate, type EmailKind, type EmailTemplate } from "./email-template";
import { normalizeTheme, settingsSchema, withMapSection, type Settings } from "./settings-shared";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Role = "super_admin" | "host";

export type AppUser = { id: string; clerkId: string; email: string; name: string; /** profile photo address ("" = none: show the first letter) */ imageUrl: string; role: Role; active: boolean; createdAt: string; lastSeenAt: string };

export type EventRow = { id: string; ownerId: string; slug: string; title: string; published: boolean; notifyHost: boolean; createdAt: string; updatedAt: string };
/** An event with its reply counts: `people` is the number of guests who said yes (each reply counts its guests). */
export type EventSummary = EventRow & { replies: number; attending: number; notAttending: number; people: number };
export type AdminEventSummary = EventSummary & { ownerEmail: string; ownerName: string; ownerActive: boolean };

export type RsvpInput = { name: string; email: string; attending: boolean; guests: number; message?: string };
export type RsvpRow = { id: string; name: string; email: string; attending: boolean; guests: number; message: string; cardSent: boolean; createdAt: string };

export type UserWithStats = AppUser & { events: number; replies: number };
export type PlatformStats = { users: number; activeUsers: number; disabledUsers: number; events: number; publishedEvents: number; replies: number; attending: number; notAttending: number; people: number };

export type EmailLogRow = { id: string; kind: string; to: string; status: string; error: string; sentAt: string };

/* ------------------------------------------------------------------ */
/* Row mapping                                                         */
/* ------------------------------------------------------------------ */

const iso = (v: unknown) => new Date(v as string).toISOString();
const num = (v: unknown) => Number(v ?? 0);

const toUser = (r: Row): AppUser => ({
  id: String(r.id),
  clerkId: String(r.clerk_id),
  email: String(r.email),
  name: String(r.name ?? ""),
  imageUrl: String(r.image_url ?? ""),
  role: r.role === "super_admin" ? "super_admin" : "host",
  active: !!r.active,
  createdAt: iso(r.created_at),
  lastSeenAt: iso(r.last_seen_at),
});

const toEvent = (r: Row): EventRow => ({
  id: String(r.id),
  ownerId: String(r.owner_id),
  slug: String(r.slug),
  title: String(r.title),
  published: !!r.published,
  notifyHost: r.notify_host !== false,
  createdAt: iso(r.created_at),
  updatedAt: iso(r.updated_at),
});

const toSummary = (r: Row): EventSummary => ({
  ...toEvent(r),
  replies: num(r.replies),
  attending: num(r.attending),
  notAttending: num(r.not_attending),
  people: num(r.people),
});

const toRsvp = (r: Row): RsvpRow => ({
  id: String(r.id),
  name: String(r.name),
  email: String(r.email),
  attending: !!r.attending,
  guests: num(r.guests),
  message: String(r.message ?? ""),
  cardSent: !!r.card_sent,
  createdAt: iso(r.created_at),
});

const db = async () => {
  await ensureSchema();
  return sql();
};

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

/** Emails that become super admins when they first sign in (SUPER_ADMIN_EMAILS, comma separated). */
export const superAdminEmails = () =>
  (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

export async function getUserByClerkId(clerkId: string): Promise<AppUser | null> {
  const q = await db();
  const rows = await q`select * from users where clerk_id = ${clerkId}`;
  return rows[0] ? toUser(rows[0]) : null;
}

export async function getUserById(id: string): Promise<AppUser | null> {
  const q = await db();
  const rows = await q`select * from users where id = ${id}`;
  return rows[0] ? toUser(rows[0]) : null;
}

/** First sign-in creates the user; later calls refresh the name and email. A listed email is promoted to super admin, never demoted here. */
export async function upsertUser(input: { clerkId: string; email: string; name: string; imageUrl?: string }): Promise<AppUser> {
  const q = await db();
  const email = input.email.toLowerCase();
  const role: Role = superAdminEmails().includes(email) ? "super_admin" : "host";
  const rows = await q`
    insert into users (clerk_id, email, name, image_url, role) values (${input.clerkId}, ${email}, ${input.name}, ${input.imageUrl ?? ""}, ${role})
    on conflict (clerk_id) do update set
      email = excluded.email,
      name = excluded.name,
      image_url = case when excluded.image_url <> '' then excluded.image_url else users.image_url end,
      last_seen_at = now(),
      role = case when excluded.role = 'super_admin' then 'super_admin' else users.role end
    returning *`;
  return toUser(rows[0]);
}

/** Saves the profile photo address ("" removes it). */
export async function setUserImage(id: string, imageUrl: string) {
  const q = await db();
  await q`update users set image_url = ${imageUrl} where id = ${id}`;
}

export async function touchUser(id: string) {
  const q = await db();
  await q`update users set last_seen_at = now() where id = ${id}`;
}

export async function listUsersWithStats(): Promise<UserWithStats[]> {
  const q = await db();
  const rows = await q`
    select u.*,
      (select count(*)::int from events e where e.owner_id = u.id) as events,
      (select count(*)::int from event_rsvps r join events e on e.id = r.event_id where e.owner_id = u.id) as replies
    from users u order by u.created_at desc`;
  return rows.map((r) => ({ ...toUser(r), events: num(r.events), replies: num(r.replies) }));
}

export async function setUserActive(id: string, active: boolean) {
  const q = await db();
  const rows = await q`update users set active = ${active} where id = ${id} returning *`;
  return rows[0] ? toUser(rows[0]) : null;
}

export async function setUserRole(id: string, role: Role) {
  const q = await db();
  const rows = await q`update users set role = ${role} where id = ${id} returning *`;
  return rows[0] ? toUser(rows[0]) : null;
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

const slugBase = (title: string) =>
  title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40)
    .replace(/^-|-$/g, "") || "event";

/** Creates an event with its own design; the slug is the public address (/e/<slug>). */
export async function createEvent(ownerId: string, title: string, settings: Settings): Promise<EventRow> {
  const q = await db();
  for (let i = 0; i < 5; i++) {
    const slug = `${slugBase(title)}-${randomBytes(3).toString("hex")}`;
    const rows = await q`
      insert into events (owner_id, slug, title, settings) values (${ownerId}, ${slug}, ${title}, ${JSON.stringify(settings)}::jsonb)
      on conflict (slug) do nothing returning *`;
    if (rows[0]) return toEvent(rows[0]);
  }
  throw new Error("Could not create a unique address for the event.");
}

/** One event by id; with `ownerId` it only matches when that user owns it (hosts), without it any event (super admin). */
export async function getEvent(id: string, ownerId?: string): Promise<EventRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const q = await db();
  const rows = ownerId ? await q`select * from events where id = ${id} and owner_id = ${ownerId}` : await q`select * from events where id = ${id}`;
  return rows[0] ? toEvent(rows[0]) : null;
}

export function parseSettings(stored: unknown): Settings | null {
  if (!stored || typeof stored !== "object") return null;
  const s = stored as Record<string, unknown>;
  const parsed = settingsSchema.safeParse({ ...s, theme: normalizeTheme(s.theme) });
  return parsed.success ? withMapSection(parsed.data) : null;
}

export async function getEventSettings(id: string): Promise<Settings | null> {
  const q = await db();
  const rows = await q`select settings from events where id = ${id}`;
  return rows[0] ? parseSettings(rows[0].settings) : null;
}

/** The public page: only published events whose owner is still active. */
export async function getPublicEvent(slug: string): Promise<{ event: EventRow; settings: Settings; hostEmail: string } | null> {
  const q = await db();
  const rows = await q`
    select e.*, u.email as owner_email from events e join users u on u.id = e.owner_id
    where e.slug = ${slug} and e.published and u.active`;
  if (!rows[0]) return null;
  const settings = parseSettings(rows[0].settings);
  return settings ? { event: toEvent(rows[0]), settings, hostEmail: String(rows[0].owner_email) } : null;
}

export async function updateEventSettings(id: string, settings: Settings) {
  const q = await db();
  const title = settings.name.trim() || "Untitled event";
  const rows = await q`update events set settings = ${JSON.stringify(settings)}::jsonb, title = ${title}, updated_at = now() where id = ${id} returning *`;
  return rows[0] ? toEvent(rows[0]) : null;
}

export async function setEventPublished(id: string, published: boolean) {
  const q = await db();
  const rows = await q`update events set published = ${published}, updated_at = now() where id = ${id} returning *`;
  return rows[0] ? toEvent(rows[0]) : null;
}

export async function setEventNotifyHost(id: string, notifyHost: boolean) {
  const q = await db();
  const rows = await q`update events set notify_host = ${notifyHost}, updated_at = now() where id = ${id} returning *`;
  return rows[0] ? toEvent(rows[0]) : null;
}

export async function deleteEvent(id: string) {
  const q = await db();
  await q`delete from events where id = ${id}`;
}

export async function listEventsForOwner(ownerId: string): Promise<EventSummary[]> {
  const q = await db();
  const rows = await q`
    select e.*,
      (select count(*)::int from event_rsvps r where r.event_id = e.id) as replies,
      (select count(*)::int from event_rsvps r where r.event_id = e.id and r.attending) as attending,
      (select count(*)::int from event_rsvps r where r.event_id = e.id and not r.attending) as not_attending,
      (select coalesce(sum(r.guests), 0)::int from event_rsvps r where r.event_id = e.id and r.attending) as people
    from events e where e.owner_id = ${ownerId} order by e.created_at desc`;
  return rows.map(toSummary);
}

export async function getEventSummary(id: string): Promise<EventSummary | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const q = await db();
  const rows = await q`
    select e.*,
      (select count(*)::int from event_rsvps r where r.event_id = e.id) as replies,
      (select count(*)::int from event_rsvps r where r.event_id = e.id and r.attending) as attending,
      (select count(*)::int from event_rsvps r where r.event_id = e.id and not r.attending) as not_attending,
      (select coalesce(sum(r.guests), 0)::int from event_rsvps r where r.event_id = e.id and r.attending) as people
    from events e where e.id = ${id}`;
  return rows[0] ? toSummary(rows[0]) : null;
}

export async function listAllEvents(): Promise<AdminEventSummary[]> {
  const q = await db();
  const rows = await q`
    select e.*, u.email as owner_email, u.name as owner_name, u.active as owner_active,
      (select count(*)::int from event_rsvps r where r.event_id = e.id) as replies,
      (select count(*)::int from event_rsvps r where r.event_id = e.id and r.attending) as attending,
      (select count(*)::int from event_rsvps r where r.event_id = e.id and not r.attending) as not_attending,
      (select coalesce(sum(r.guests), 0)::int from event_rsvps r where r.event_id = e.id and r.attending) as people
    from events e join users u on u.id = e.owner_id order by e.created_at desc`;
  return rows.map((r) => ({ ...toSummary(r), ownerEmail: String(r.owner_email), ownerName: String(r.owner_name ?? ""), ownerActive: !!r.owner_active }));
}

export async function slugsForOwner(ownerId: string): Promise<string[]> {
  const q = await db();
  return (await q`select slug from events where owner_id = ${ownerId}`).map((r) => String(r.slug));
}

export async function platformStats(): Promise<PlatformStats> {
  const q = await db();
  const [u] = await q`select count(*)::int as users, count(*) filter (where active)::int as active from users`;
  const [e] = await q`select count(*)::int as events, count(*) filter (where published)::int as published from events`;
  const [r] = await q`
    select count(*)::int as replies,
      count(*) filter (where attending)::int as attending,
      count(*) filter (where not attending)::int as not_attending,
      coalesce(sum(guests) filter (where attending), 0)::int as people
    from event_rsvps`;
  return {
    users: num(u.users),
    activeUsers: num(u.active),
    disabledUsers: num(u.users) - num(u.active),
    events: num(e.events),
    publishedEvents: num(e.published),
    replies: num(r.replies),
    attending: num(r.attending),
    notAttending: num(r.not_attending),
    people: num(r.people),
  };
}

/* ------------------------------------------------------------------ */
/* RSVPs                                                               */
/* ------------------------------------------------------------------ */

export async function emailExists(eventId: string, email: string): Promise<boolean> {
  const q = await db();
  return (await q`select 1 from event_rsvps where event_id = ${eventId} and lower(email) = ${email.toLowerCase()} limit 1`).length > 0;
}

/** Returns the new row's id, or null when that email has already replied to this event. */
export async function createRsvp(eventId: string, r: RsvpInput): Promise<{ id: string } | null> {
  const q = await db();
  const rows = await q`
    insert into event_rsvps (event_id, name, email, attending, guests, message)
    values (${eventId}, ${r.name}, ${r.email.toLowerCase()}, ${r.attending}, ${r.attending ? r.guests : 0}, ${r.message ?? ""})
    on conflict (event_id, (lower(email))) do nothing returning id`;
  return rows[0] ? { id: String(rows[0].id) } : null;
}

export async function markCardSent(id: string) {
  const q = await db();
  await q`update event_rsvps set card_sent = true where id = ${id}`;
}

export async function listRsvps(eventId: string): Promise<RsvpRow[]> {
  const q = await db();
  return (await q`select * from event_rsvps where event_id = ${eventId} order by created_at desc`).map(toRsvp);
}

/* ------------------------------------------------------------------ */
/* Email templates and log                                             */
/* ------------------------------------------------------------------ */

export async function getTemplate(eventId: string, kind: EmailKind): Promise<EmailTemplate> {
  const q = await db();
  const rows = await q`select data from email_templates where event_id = ${eventId} and kind = ${kind}`;
  return normalizeTemplate(kind, rows[0]?.data);
}

export async function saveTemplate(eventId: string, kind: EmailKind, data: EmailTemplate) {
  const q = await db();
  await q`
    insert into email_templates (event_id, kind, data) values (${eventId}, ${kind}, ${JSON.stringify(data)}::jsonb)
    on conflict (event_id, kind) do update set data = excluded.data, updated_at = now()`;
}

export async function logEmail(eventId: string, kind: string, to: string, status: "sent" | "failed", error = "") {
  const q = await db();
  await q`insert into email_log (event_id, kind, to_email, status, error) values (${eventId}, ${kind}, ${to.toLowerCase()}, ${status}, ${error.slice(0, 300)})`;
}

/** Emails sent by the whole site in the last 24 hours: used to stay under the sending service's daily limit. */
export async function emailsSentLast24h(): Promise<number> {
  const q = await db();
  const rows = await q`select count(*)::int as n from email_log where status = 'sent' and sent_at > now() - interval '1 day'`;
  return num(rows[0]?.n);
}

/** Invitations sent today for an event: used to cap how many one host can send. */
export async function invitesSentToday(eventId: string): Promise<number> {
  const q = await db();
  const rows = await q`select count(*)::int as n from email_log where event_id = ${eventId} and kind = 'invitation' and status = 'sent' and sent_at > now() - interval '1 day'`;
  return num(rows[0]?.n);
}

export async function listEmailLog(eventId: string, limit = 30): Promise<EmailLogRow[]> {
  const q = await db();
  return (await q`select * from email_log where event_id = ${eventId} order by sent_at desc limit ${limit}`).map((r) => ({
    id: String(r.id),
    kind: String(r.kind),
    to: String(r.to_email),
    status: String(r.status),
    error: String(r.error ?? ""),
    sentAt: iso(r.sent_at),
  }));
}
