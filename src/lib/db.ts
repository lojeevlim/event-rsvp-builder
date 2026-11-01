import { neon } from "@neondatabase/serverless";

export type Row = Record<string, unknown>;
export type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Row[]>;

let override: Sql | undefined;
/** Lets a test script run the queries against another Postgres (never used by the app itself). */
export const setSqlForTests = (fn: Sql | undefined) => {
  override = fn;
  ready = undefined;
};

/** The app needs Neon Postgres: users, events, guests and templates all live there. */
export const dbEnabled = () => !!override || !!process.env.DATABASE_URL;
export const sql = (): Sql => override ?? (neon(process.env.DATABASE_URL!) as unknown as Sql);

let ready: Promise<void> | undefined;

/** Creates the tables on first use (safe to run every time). */
export function ensureSchema() {
  return (ready ??= (async () => {
    const q = sql();
    await q`create table if not exists users (
      id uuid primary key default gen_random_uuid(),
      clerk_id text not null unique,
      email text not null,
      name text not null default '',
      image_url text not null default '',
      role text not null default 'host' check (role in ('super_admin', 'host')),
      active boolean not null default true,
      created_at timestamptz not null default now(),
      last_seen_at timestamptz not null default now()
    )`;
    await q`alter table users add column if not exists image_url text not null default ''`;
    await q`create table if not exists events (
      id uuid primary key default gen_random_uuid(),
      owner_id uuid not null references users(id) on delete cascade,
      slug text not null unique,
      title text not null,
      settings jsonb not null,
      published boolean not null default true,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )`;
    await q`create index if not exists events_owner_idx on events (owner_id)`;
    await q`create table if not exists event_rsvps (
      id uuid primary key default gen_random_uuid(),
      event_id uuid not null references events(id) on delete cascade,
      name text not null,
      email text not null,
      attending boolean not null,
      guests integer not null default 1,
      message text not null default '',
      card_sent boolean not null default false,
      created_at timestamptz not null default now()
    )`;
    await q`create unique index if not exists event_rsvps_email_key on event_rsvps (event_id, lower(email))`;
    await q`create table if not exists email_templates (
      event_id uuid not null references events(id) on delete cascade,
      kind text not null check (kind in ('invitation', 'confirmation')),
      data jsonb not null,
      updated_at timestamptz not null default now(),
      primary key (event_id, kind)
    )`;
    await q`create table if not exists email_log (
      id uuid primary key default gen_random_uuid(),
      event_id uuid not null references events(id) on delete cascade,
      kind text not null,
      to_email text not null,
      status text not null,
      error text not null default '',
      sent_at timestamptz not null default now()
    )`;
    await q`create index if not exists email_log_event_idx on email_log (event_id, sent_at desc)`;
  })().catch((err) => {
    ready = undefined; // try again on the next request
    throw err;
  }));
}
