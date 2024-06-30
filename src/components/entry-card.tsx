import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Entry } from "@/types";
import { getJapaneseLabel } from "@/lib/utils";

interface EntryCardProps {
  entry: Entry;
}

export function EntryCard({ entry }: EntryCardProps) {
  return (
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
          <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md animate-pulse whitespace-nowrap">
            {getJapaneseLabel(entry.type)}
          </div>
        </div>
        <div className="p-4 bg-opacity-75 bg-gradient-to-r from-yellow-300 to-orange-400 flex flex-col justify-between h-full">
          <CardHeader className="p-0 mb-2">
            <CardTitle className="text-lg font-bold line-clamp-2 text-black neon-text card-title-glow">
              {entry.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-auto">
            <p className="text-sm flex items-center mt-2">
              <Calendar className="mr-2 flex-shrink-0 animate-spin text-purple-600" size={14} />
              <span className="truncate bg-yellow-200 text-black px-2 py-1 rounded-full font-semibold">
                {entry.date}
              </span>
            </p>
          </CardContent>
        </div>
      </a>
    </Card>
  );
}
