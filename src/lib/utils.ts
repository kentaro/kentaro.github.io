import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getJapaneseLabel = (key: string): string => {
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

export const getArchiveUrl = (type: string): string => {
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
