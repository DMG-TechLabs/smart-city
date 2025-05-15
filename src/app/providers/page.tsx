"use client";

import { usePocketBase } from "@/context/DatabaseContext.tsx";
import { useEffect, useState } from "react";
import { ProviderUI } from "./ProviderUI.tsx";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Api } from "./Api.tsx";
import Link from "next/link";

export default function Providers() {
    const pb = usePocketBase() as unknown as excludeHooks<PocketBase>;
    const [providers, setProviders] = useState<Api[]>([]);

    useEffect(() => {
        async function fetchProviders(): Promise<void> {
            const loadedProviders = await Api.loadApis(pb);
            setProviders(loadedProviders);
        }

        fetchProviders();
    }, [pb]);

    async function deleteProvider(p: Api) {
        const success = await p.delete(pb);
        if (success) {
            setProviders(prev => prev.filter(a => a.provider !== p.provider));
        }
    }

    return (
      <div className="flex flex-col items-center w-full">
        <div className="text-center mt-8">
          <h1 className="text-2xl font-bold mb-4">Providers</h1>
          <ScrollArea className="h-full w-[50vw] max-h-[80vh] rounded-md border p-4">
            {providers.map((provider, index) => (
              <div key={provider.provider ?? index}>
                <ProviderUI provider={provider} onDelete={() => deleteProvider(provider)} />
              </div>
            ))}
          </ScrollArea>
        </div>

        <div className="mt-4">
          <Link
            href="/providers/add"
            className="inline-block bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
          >
            Add
          </Link>
        </div>
      </div>
    );
}

