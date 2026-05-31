"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingList } from "@/features/trends/components/TrendingList";
import { TrendSearch } from "@/features/trends/components/TrendSearch";

export default function TrendsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight gradient-text leading-tight">
          Dashboard de Tendências
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Acompanhe o que está bombando agora no Brasil e pesquise termos específicos.
        </p>
      </div>
      <Tabs defaultValue="trending" className="w-full">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 h-12 bg-muted/80 p-1">
          <TabsTrigger
            value="trending"
            className="data-[state=active]:gradient-bg data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300 font-medium"
          >
            🔥 Em Alta Agora
          </TabsTrigger>
          <TabsTrigger
            value="search"
            className="data-[state=active]:gradient-bg data-[state=active]:text-white data-[state=active]:shadow-md rounded-md transition-all duration-300 font-medium"
          >
            🔎 Buscar Termo
          </TabsTrigger>
        </TabsList>
        <TabsContent value="trending" className="mt-6">
          <TrendingList />
        </TabsContent>
        <TabsContent value="search" className="mt-6">
          <TrendSearch />
        </TabsContent>
      </Tabs>
    </div>
  );
}
