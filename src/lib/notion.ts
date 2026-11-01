import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
let dataSourceId: string | undefined;

async function getDataSourceId() {
  if (dataSourceId) return dataSourceId;
  const db = await notion.databases.retrieve({ database_id: process.env.NOTION_DB_ID! });
  const id = (db as { data_sources?: { id: string }[] }).data_sources?.[0]?.id;
  if (!id) throw new Error("Notion database has no data source");
  return (dataSourceId = id);
}

export type Rsvp = {
  name: string;
  email: string;
  attending: boolean;
  guests: number;
  message?: string;
};

export async function emailExists(email: string) {
  const res = await notion.dataSources.query({
    data_source_id: await getDataSourceId(),
    filter: { property: "Email", email: { equals: email } },
    page_size: 1,
  });
  return res.results.length > 0;
}

export async function createRsvp(r: Rsvp) {
  const text = (content: string) => [{ text: { content } }];
  return notion.pages.create({
    parent: { type: "data_source_id", data_source_id: await getDataSourceId() },
    properties: {
      Name: { title: text(r.name) },
      Email: { email: r.email },
      Status: { select: { name: r.attending ? "Attending" : "Not attending" } },
      Guests: { number: r.attending ? r.guests : 0 },
      Message: { rich_text: text(r.message ?? "") },
    },
  });
}

export async function markCardSent(pageId: string) {
  await notion.pages.update({ page_id: pageId, properties: { "Card Sent": { checkbox: true } } });
}

export type RsvpRow = {
  id: string;
  name: string;
  email: string;
  attending: boolean;
  guests: number;
  message: string;
  cardSent: boolean;
  createdAt: string;
};

export async function listRsvps(): Promise<RsvpRow[]> {
  const rows: RsvpRow[] = [];
  let cursor: string | undefined;
  do {
    const res = await notion.dataSources.query({
      data_source_id: await getDataSourceId(),
      sorts: [{ timestamp: "created_time", direction: "descending" }],
      start_cursor: cursor,
      page_size: 100,
    });
    for (const page of res.results) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = (page as any).properties ?? {};
      rows.push({
        id: page.id,
        name: p.Name?.title?.map((t: { plain_text: string }) => t.plain_text).join("") ?? "",
        email: p.Email?.email ?? "",
        attending: p.Status?.select?.name === "Attending",
        guests: p.Guests?.number ?? 0,
        message: p.Message?.rich_text?.map((t: { plain_text: string }) => t.plain_text).join("") ?? "",
        cardSent: !!p["Card Sent"]?.checkbox,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createdAt: (page as any).created_time ?? "",
      });
    }
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return rows;
}
