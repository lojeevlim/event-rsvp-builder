import { promises as fs } from "fs";
import path from "path";
import { revalidateTag } from "next/cache";
import { isAdmin } from "@/lib/admin-auth";
import { readSettings, settingsSchema, UPLOAD_DIR, writeSettings } from "@/lib/settings";
import { imageUrls } from "@/lib/settings-shared";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(await readSettings());
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = settingsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return Response.json({ error: `${issue.path.join(".")}: ${issue.message}` }, { status: 400 });
  }
  const before = await readSettings();
  await writeSettings(parsed.data);
  revalidateTag("settings", { expire: 0 });

  // delete uploads that are no longer used anywhere on the page
  const keep = new Set(imageUrls(parsed.data));
  for (const url of imageUrls(before)) {
    if (!keep.has(url)) await fs.unlink(path.join(UPLOAD_DIR, path.basename(url))).catch(() => {});
  }
  return Response.json(parsed.data);
}
