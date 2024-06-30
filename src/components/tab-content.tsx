import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { EntryCard } from "@/components/entry-card";
import { Entry } from "@/types";
import { tabIcons } from "@/constants";

interface TabContentProps {
  entries: Entry[];
  profileContent: string;
  getArchiveUrl: (type: string) => string;
  getJapaneseLabel: (key: string) => string;
}

export function TabContent({
  entries,
  profileContent,
  getArchiveUrl,
  getJapaneseLabel,
}: TabContentProps) {
  return (
    <>
      <TabsContent value="all">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="profile">
        <Card className="mb-4 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="py-8">
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => (
                  <h1
                    className="text-4xl font-bold mb-8 text-gray-800 border-b-2 pb-4"
                    {...props}
                  />
                ),
                h2: ({ ...props }) => (
                  <h2
                    className="text-3xl font-semibold mt-10 mb-6 text-gray-700 border-l-4 border-gray-300 pl-4"
                    {...props}
                  />
                ),
                h3: ({ ...props }) => (
                  <h3
                    className="text-2xl font-medium mt-8 mb-4 text-gray-600"
                    {...props}
                  />
                ),
                h4: ({ ...props }) => (
                  <h4
                    className="text-xl font-medium mt-6 mb-3 text-gray-600"
                    {...props}
                  />
                ),
                p: ({ ...props }) => (
                  <p
                    className="mb-4 text-gray-600 leading-relaxed"
                    {...props}
                  />
                ),
                ul: ({ ...props }) => (
                  <ul
                    className="list-disc pl-5 mb-4 text-gray-600"
                    {...props}
                  />
                ),
                li: ({ ...props }) => (
                  <li className="mb-2" {...props} />
                ),
                a: ({ ...props }) => (
                  <a className="text-blue-600 hover:underline" {...props} />
                ),
                hr: ({ ...props }) => (
                  <hr className="my-8 border-t border-gray-300" {...props} />
                ),
              }}
            >
              {profileContent}
            </ReactMarkdown>
          </CardContent>
        </Card>
      </TabsContent>

      {Object.keys(tabIcons).map(
        (type) =>
          type !== "all" &&
          type !== "profile" && (
            <TabsContent key={type} value={type}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {entries
                  .filter((entry) => entry.type === type)
                  .map((entry) => (
                    <EntryCard key={entry.id} entry={entry} />
                  ))}
              </div>
              <div className="mt-4 text-center">
                <a
                  href={getArchiveUrl(type)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                >
                  {getJapaneseLabel(type)}の一覧を見る
                </a>
              </div>
            </TabsContent>
          )
      )}
    </>
  );
}
