import Parser from "rss-parser";
import { Entry } from "@/types";

export async function getEntries(): Promise<Entry[]> {
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
