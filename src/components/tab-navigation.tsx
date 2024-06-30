import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { tabIcons } from "@/constants";
import { getJapaneseLabel } from "@/lib/utils";

export function TabNavigation() {
  return (
    <ScrollArea className="w-full mb-6">
      <div className="flex justify-center">
        <TabsList className="inline-flex p-0.5 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-full shadow-inner gaming-border">
          {[
            <TabsTrigger key="all" value="all" className="px-2 py-1 text-xs font-medium flex items-center whitespace-nowrap rounded-full transition-all duration-200 hover:bg-white hover:bg-opacity-20 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:via-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md">
              <span>最新</span>
            </TabsTrigger>,
            <TabsTrigger key="profile" value="profile" className="px-2 py-1 text-xs font-medium flex items-center whitespace-nowrap rounded-full transition-all duration-200 hover:bg-white hover:bg-opacity-20 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:via-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md">
              <span>プロフィール</span>
            </TabsTrigger>,
            ...Object.entries(tabIcons)
              .filter(([key]) => key !== "all" && key !== "profile")
              .map(([key, Icon]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="px-2 py-1 text-xs font-medium flex items-center whitespace-nowrap rounded-full transition-all duration-200 hover:bg-white hover:bg-opacity-20 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:via-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  <Icon size={16} />
                  <span className="ml-1 hidden sm:inline">{getJapaneseLabel(key)}</span>
                </TabsTrigger>
              ))
          ]}
        </TabsList>
      </div>
    </ScrollArea>
  );
}
