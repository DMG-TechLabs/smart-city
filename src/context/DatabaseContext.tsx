"use client"; // Required for using state & context in Next.js App Router

import { createContext, useContext, useMemo, ReactNode } from "react";
import PocketBase from "pocketbase";

// Create the PocketBase client context
const PocketBaseContext = createContext<PocketBase | null>(null);

// Provider component
export function PocketBaseProvider({ children }: { children: ReactNode }) {
    const pb = useMemo(() => {
        const client = new PocketBase("http://127.0.0.1:8090");
        return client;
    }, []);

    return (
        <PocketBaseContext.Provider value={pb}>
        {children}
        </PocketBaseContext.Provider>
    );
}

// Custom hook to use PocketBase client
export function usePocketBase() {
    const context = useContext(PocketBaseContext);
    if (!context) {
        throw new Error("usePocketBase must be used within a PocketBaseProvider");
    }
    return context;
}

