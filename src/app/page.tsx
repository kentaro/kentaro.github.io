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
    <Card className="mb-4 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <a href={entry.link} target="_blank" className="block">
        <div className="flex flex-col">
          <div className="relative w-full h-[200px] sm:h-[150px]">
            <Image
              src={entry.image}
              alt={entry.title || ""}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <CardHeader className="p-0 mb-2">
              <CardTitle className="flex items-center text-sm">
                {tabIcons[entry.type]}
                <span className="ml-2 line-clamp-2">{entry.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-xs text-gray-500 flex items-center mt-2">
                <Calendar className="mr-2 flex-shrink-0" size={14} />
                <span className="truncate">{entry.date}</span>
              </p>
            </CardContent>
          </div>
        </div>
      </a>
    </Card>
  );

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 py-4 sm:py-8 font-noto-sans-jp">
      <div className="text-center mb-8 sm:mb-12">
        <Image
          src={(metadata.icons as { icon: string })?.icon || ""}
          alt="Profile"
          width={96}
          height={96}
          className="rounded-full mx-auto mb-4 sm:mb-6 border-4 border-gray-200 shadow-lg"
        />
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">
          栗林健太郎
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">作家</p>
        <div className="flex justify-center space-x-4">
          {bioLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              {link.icon}
              <span className="sr-only">{link.label}</span>
            </a>
          ))}
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <ScrollArea className="w-full mb-4 sm:mb-6">
          <TabsList className="flex justify-center p-1 bg-gray-100 rounded-lg overflow-x-auto">
            <TabsTrigger
              value="profile"
              className="px-2 py-1 text-xs flex items-center whitespace-nowrap"
            >
              {tabIcons.profile}
              <span className="ml-1 hidden sm:inline">プロフィール</span>
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="px-2 py-1 text-xs flex items-center whitespace-nowrap"
            >
              {tabIcons.all}
              <span className="ml-1 hidden sm:inline">全て</span>
            </TabsTrigger>
            {Object.entries(tabIcons).map(
              ([key, icon]) =>
                key !== "all" &&
                key !== "profile" && (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="px-2 py-1 text-xs flex items-center whitespace-nowrap"
                  >
                    {icon}
                    <span className="ml-1 hidden sm:inline">
                      {getJapaneseLabel(key)}
                    </span>
                  </TabsTrigger>
                )
            )}
          </TabsList>
        </ScrollArea>

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

        <TabsContent value="all">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
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
  );
}
