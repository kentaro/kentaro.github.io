import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TabNavigation } from "@/components/tab-navigation";
import { TabContent } from "@/components/tab-content";
import { Header } from "@/components/header";
import { getEntries } from "@/lib/get-entries";
import { getJapaneseLabel, getArchiveUrl } from "@/lib/utils";
import fs from "fs/promises";
import path from "path";

export default async function Page() {
  const entries = await getEntries();

  const profileContent = await fs.readFile(
    path.join(process.cwd(), "contents", "index.md"),
    "utf-8"
  );

  return (
    <div className="w-full mx-auto font-vt323 y2k-bg">
      <Header />

      <div className="max-w-3xl mx-auto px-2 sm:px-4 py-4 sm:py-8 streamer-bg relative">
        <Tabs defaultValue="all" className="w-full">
          <TabNavigation />

          <TabContent
            entries={entries}
            profileContent={profileContent}
            getArchiveUrl={getArchiveUrl}
            getJapaneseLabel={getJapaneseLabel}
          />
        </Tabs>
      </div>
    </div>
  );
}
