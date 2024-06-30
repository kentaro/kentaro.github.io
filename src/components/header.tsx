import Image from "next/image";
import { metadata } from "@/app/layout";
import { bioLinks } from "@/constants";

export function Header() {
  return (
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
          <p className="text-2xl sm:text-3xl text-blue-100 my-4 animate-float">作家</p>
          <div className="flex justify-center space-x-6">
            {bioLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-blue-200 transition-colors duration-200 transform hover:scale-125 animate-bounce"
              >
                <link.icon size={20} />
                <span className="sr-only">{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
