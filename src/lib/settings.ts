import { settingsSchema, type Settings } from "./settings-shared";

export { settingsSchema, type Settings };

/** Uploaded images live under this folder when Cloudflare R2 is not configured (local development). */
import path from "path";
export const UPLOAD_DIR = path.join(process.env.DATA_DIR ?? path.join(process.cwd(), "data"), "uploads");
