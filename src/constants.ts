import {
  Mail,
  Github,
  X,
  Facebook,
  Linkedin,
  User,
  LayoutGrid,
  BookOpen,
  Headphones,
  Rss,
  Youtube,
  Presentation,
  Music,
} from "lucide-react";

export const bioLinks = [
  {
    icon: Mail,
    url: "mailto:kentarok@gmail.com",
    label: "Email",
  },
  {
    icon: Github,
    url: "https://github.com/kentaro",
    label: "GitHub",
  },
  { icon: X, url: "https://x.com/kentaro", label: "Twitter" },
  {
    icon: Facebook,
    url: "https://facebook.com/kentarok",
    label: "Facebook",
  },
  {
    icon: Linkedin,
    url: "https://linkedin.com/in/kentaro-kuribayashi",
    label: "LinkedIn",
  },
];

export const tabIcons = {
  profile: User,
  all: LayoutGrid,
  note: BookOpen,
  zenn: Rss,
  speakerdeck: Presentation,
  youtube: Youtube,
  soundcloud: Music,
  listen: Headphones,
};
