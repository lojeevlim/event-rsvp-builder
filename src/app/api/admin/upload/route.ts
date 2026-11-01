import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { isAdmin } from "@/lib/admin-auth";
import { UPLOAD_DIR } from "@/lib/settings";

const TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" };
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const file = (await req.formData().catch(() => null))?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file." }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return Response.json({ error: "Only PNG, JPG, WEBP or GIF images." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "Image is over 5 MB." }, { status: 400 });

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${randomUUID()}.${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return Response.json({ url: `/api/img/${name}` });
}
