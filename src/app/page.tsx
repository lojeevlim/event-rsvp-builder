import PageView from "@/components/PageView";
import { getSettings } from "@/lib/settings";
import { applyName } from "@/lib/settings-shared";

export default async function Home() {
  return <PageView s={applyName(await getSettings())} />;
}
