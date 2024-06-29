import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  Rss,
  Github,
  X,
  Linkedin,
  Mail,
  Headphones,
  BookOpen,
  Presentation,
  Music,
  Youtube,
  Facebook,
  LayoutGrid,
  User,
} from "lucide-react";
import Image from "next/image";
import Parser from "rss-parser";
import ReactMarkdown from "react-markdown";
import fs from "fs/promises";
import path from "path";
import { metadata } from "./layout";

interface Entry {
  id: number;
  title: string | undefined;
  date: string;
  type: string;
  image: string;
  link: string;
}

const getJapaneseLabel = (key: string): string => {
  const labels: { [key: string]: string } = {
    profile: "プロフィール",
    note: "ブログ",
    listen: "ポッドキャスト",
    zenn: "技術ブログ",
    youtube: "動画",
    speakerdeck: "スライド",
    soundcloud: "音楽",
  };
  return labels[key] || key;
};

const getArchiveUrl = (type: string): string => {
  const urls: { [key: string]: string } = {
    note: "https://note.com/kentarok",
    listen: "https://listen.style/p/kentaro",
    zenn: "https://zenn.dev/kentarok",
    youtube: "https://youtube.com/@kentarok",
    speakerdeck: "https://speakerdeck.com/kentaro",
    soundcloud: "https://soundcloud.com/kentarok",
  };
  return urls[type] || `https://kentarokuribayashi.com/archive/${type}`;
};

async function getEntries(): Promise<Entry[]> {
  const parser = new Parser();
  const feed = await parser.parseURL("https://kentarokuribayashi.com/feed");
  return feed.items.map((item, index) => {
    let type = "note";
    const link = item.link || "";

    if (link.includes("note.com")) {
      type = "note";
    } else if (link.includes("listen.style")) {
      type = "listen";
    } else if (link.includes("zenn.dev")) {
      type = "zenn";
    } else if (link.includes("youtube.com") || link.includes("youtu.be")) {
      type = "youtube";
    } else if (link.includes("speakerdeck.com")) {
      type = "speakerdeck";
    } else if (link.includes("soundcloud.com")) {
      type = "soundcloud";
    }

    return {
      id: index + 1,
      title: item.title,
      date: item.pubDate
        ? new Date(item.pubDate).toISOString().split("T")[0]
        : "",
      type: type,
      image: item.enclosure?.url || "/api/placeholder/400/300",
      link: link,
    };
  });
}

const Y2KLoading = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="y2k-loading"></div>
  </div>
);

export default async function RSSAggregator() {
  const entries = await getEntries();

  // Markdownファイルを読み込む
  const profileContent = await fs.readFile(
    path.join(process.cwd(), "public", "index.md"),
    "utf-8"
  );

  const bioLinks = [
    {
      icon: <Mail size={20} />,
      url: "mailto:kentarok@gmail.com",
      label: "Email",
    },
    {
      icon: <Github size={20} />,
      url: "https://github.com/kentaro",
      label: "GitHub",
    },
    { icon: <X size={20} />, url: "https://x.com/kentaro", label: "Twitter" },
    {
      icon: <Facebook size={20} />,
      url: "https://facebook.com/kentarok",
      label: "Facebook",
    },
    {
      icon: <Linkedin size={20} />,
      url: "https://linkedin.com/in/kentaro-kuribayashi",
      label: "LinkedIn",
    },
  ];

  const tabIcons: { [key: string]: React.ReactNode } = {
    profile: <User size={16} />,
    all: <LayoutGrid size={16} />,
    note: <BookOpen size={16} />,
    listen: <Headphones size={16} />,
    zenn: <Rss size={16} />,
    youtube: <Youtube size={16} />,
    speakerdeck: <Presentation size={16} />,
    soundcloud: <Music size={16} />,
  };

  const EntryCard = ({ entry }: { entry: Entry }) => (
    <Card className="relative overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl bg-gradient-to-br from-purple-400 via-pink-500 to-yellow-500 card-hover-effect card-animated-background">
      <a href={entry.link} target="_blank" rel="noopener noreferrer" className="block">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-50"></div>
          <Image
            src={entry.image}
            alt={entry.title || ""}
            width={400}
            height={200}
            className="object-cover w-full h-48 brightness-110 contrast-110"
          />
          <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md animate-pulse">
            {getJapaneseLabel(entry.type)}
          </div>
        </div>
        <div className="p-4 bg-opacity-75 bg-black">
          <CardHeader className="p-0 mb-2">
            <CardTitle className="text-lg font-bold line-clamp-2 text-white neon-text card-title-glow">
              {entry.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-sm text-blue-200 flex items-center mt-2">
              <Calendar className="mr-2 flex-shrink-0 animate-spin" size={14} />
              <span className="truncate">{entry.date}</span>
            </p>
          </CardContent>
        </div>
      </a>
    </Card>
  );

  return (
    <div className="w-full mx-auto font-vt323 y2k-bg">
      <header className="bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-yellow-300 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-opacity-20 bg-white background-noise"></div>
        <div className="absolute inset-0 bg-grid-pattern"></div>
        <div className="absolute inset-0 bg-stars"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg mb-6 overflow-hidden relative animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 animate-pulse"></div>
              <Image
                src={(metadata.icons as { icon: string })?.icon || ""}
                alt="Profile"
                width={160}
                height={160}
                className="object-cover w-full h-full relative z-10"
              />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-white text-shadow-neon animate-pulse y2k-rainbow-text">栗林健太郎</h1>
            <p className="text-2xl sm:text-3xl text-blue-100 mb-4 neon-text animate-float">作家</p>
            <div className="flex justify-center space-x-6">
              {bioLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-blue-200 transition-colors duration-200 transform hover:scale-125 animate-bounce"
                >
                  {link.icon}
                  <span className="sr-only">{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <Tabs defaultValue="all" className="w-full">
          <ScrollArea className="w-full mb-6">
            <div className="flex justify-center">
              <TabsList className="inline-flex p-0.5 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-full shadow-inner">
                {[
                  { key: "all", label: "最新" },
                  { key: "profile", label: "プロフィール" },
                  ...Object.entries(tabIcons)
                    .filter(([key]) => key !== "all" && key !== "profile")
                    .map(([key]) => ({ key, label: getJapaneseLabel(key) }))
                ].map(({ key, label }) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="px-2 py-1 text-xs font-medium flex items-center whitespace-nowrap rounded-full transition-all duration-200 hover:bg-white hover:bg-opacity-20 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:via-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    {tabIcons[key]}
                    <span className="ml-1 hidden sm:inline">{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </ScrollArea>

          <TabsContent value="all">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="mb-4 overflow-hidden">
              <CardContent className="py-8">
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1
                        className="text-4xl font-bold mb-8 text-gray-800 border-b-2 pb-4"
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        className="text-3xl font-semibold mt-10 mb-6 text-gray-700 border-l-4 border-gray-300 pl-4"
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        className="text-2xl font-medium mt-8 mb-4 text-gray-600"
                        {...props}
                      />
                    ),
                    h4: ({ node, ...props }) => (
                      <h4
                        className="text-xl font-medium mt-6 mb-3 text-gray-600"
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <p
                        className="mb-4 text-gray-600 leading-relaxed"
                        {...props}
                      />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul
                        className="list-disc pl-5 mb-4 text-gray-600"
                        {...props}
                      />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="mb-2" {...props} />
                    ),
                    a: ({ node, ...props }) => (
                      <a className="text-blue-600 hover:underline" {...props} />
                    ),
                    hr: ({ node, ...props }) => (
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
        </Tabs>
      </div>
    </div>
  );
}
