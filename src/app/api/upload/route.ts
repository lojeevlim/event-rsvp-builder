import { randomUUID } from "crypto";
import { apiUser } from "@/lib/auth";
import { putImage, userFolder } from "@/lib/storage";

const TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" };
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const a = await apiUser();
  if ("response" in a) return a.response;
  const file = (await req.formData().catch(() => null))?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file." }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return Response.json({ error: "Only PNG, JPG, WEBP or GIF images." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "Image is over 5 MB." }, { status: 400 });

  const name = `${userFolder(a.user)}/${randomUUID()}.${ext}`;
  try {
    await putImage(name, Buffer.from(await file.arrayBuffer()), file.type);
  } catch (err) {
    console.error("Upload failed", err);
    return Response.json({ error: "Could not save the image. Try again." }, { status: 500 });
  }
  return Response.json({ url: `/api/img/${name}` });
}
