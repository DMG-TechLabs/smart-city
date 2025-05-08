"use client";

import { usePocketBase } from "@/context/DatabaseContext.tsx";
import { Api } from "./Api.tsx";
import { useEffect, useState } from "react";
import { ProviderUI } from "./ProviderUI.tsx";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Providers() {
    const pb = usePocketBase();
    const [providers, setProviders] = useState<Api[]>([]);

    useEffect(() => {
        async function fetchProviders(): Promise<void> {
            const loadedProviders = await Api.loadApis(pb);
            setProviders(loadedProviders);
        }

        fetchProviders();
    }, [pb]);

    async function deleteProvider(provider: Api) {
        const success = await provider.delete(pb);
        if (success) {
            setProviders(prev => prev.filter(a => a.id !== provider.id));
        }
    }

    return (
        <div className="flex justify-center w-full">
            <div className="text-center mt-8">
                <h1 className="text-2xl font-bold mb-4">Providers</h1>
                <ScrollArea className="h-full w-[50vw] max-h-[80vh] rounded-md border p-4">
                    {providers.map((provider, index) => (
                        <div key={provider.name ?? index}>
                            <ProviderUI provider={provider} onDelete={() => deleteProvider(provider)} />
                        </div>
                    ))}
                </ScrollArea>
            </div>
        </div>
    );
}

