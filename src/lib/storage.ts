import { promises as fs } from "fs";
import path from "path";
import { AwsClient } from "aws4fetch";
import { UPLOAD_DIR } from "./settings";

/** Uploaded images live in Cloudflare R2 when the R2_* variables are set, otherwise in the local data/uploads folder. */
const r2Config = () => {
  const { R2_ACCOUNT_ID: account, R2_ACCESS_KEY_ID: key, R2_SECRET_ACCESS_KEY: secret, R2_BUCKET: bucket } = process.env;
  return account && key && secret && bucket ? { account, key, secret, bucket } : null;
};
export const r2Enabled = () => !!r2Config();

function r2Fetch(name: string, init: RequestInit) {
  const c = r2Config()!;
  const client = new AwsClient({ accessKeyId: c.key, secretAccessKey: c.secret, service: "s3", region: "auto" });
  return client.fetch(`https://${c.account}.r2.cloudflarestorage.com/${c.bucket}/${encodeURIComponent(name)}`, init);
}

export async function putImage(name: string, data: Buffer, type: string) {
  if (!r2Enabled()) {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, name), data);
    return;
  }
  const res = await r2Fetch(name, { method: "PUT", body: new Uint8Array(data), headers: { "Content-Type": type, "Content-Length": String(data.byteLength) } });
  if (!res.ok) throw new Error(`R2 upload failed (${res.status})`);
}

/** The image bytes, or null when it does not exist. */
export async function getImage(name: string): Promise<Buffer | null> {
  if (!r2Enabled()) return fs.readFile(path.join(UPLOAD_DIR, name)).catch(() => null);
  const res = await r2Fetch(name, { method: "GET" });
  return res.ok ? Buffer.from(await res.arrayBuffer()) : null;
}

export async function deleteImage(name: string) {
  if (!r2Enabled()) return void (await fs.unlink(path.join(UPLOAD_DIR, name)).catch(() => {}));
  await r2Fetch(name, { method: "DELETE" }).catch(() => {});
}
