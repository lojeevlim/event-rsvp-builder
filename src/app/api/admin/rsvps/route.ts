import { isAdmin } from "@/lib/admin-auth";
import { listRsvps } from "@/lib/notion";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return Response.json(await listRsvps());
  } catch (err) {
    console.error("List RSVPs failed", err);
    return Response.json({ error: "Could not load RSVPs from Notion." }, { status: 500 });
  }
}
