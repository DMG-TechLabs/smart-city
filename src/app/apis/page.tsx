"use client";

import { useEffect, useState } from "react";
import { usePocketBase } from "@/context/DatabaseContext.tsx";
import { Api } from "./Api.tsx";

export default function Apis() {
    const pb = usePocketBase();

    const [pretty, setPretty] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const api = new Api("test_provider", "https://dimosnestou.gov.gr/wp-json/wp/v2/posts?categories=8");

        async function fetchAndRegister() {
            try {
                const json = await api.call();
                const formatted = Api.prettify(json);
                setPretty(formatted);

                const fields = api.extractFields(Api.extractFirst(json));
                console.log(fields);

                // This should be selected by the user
                api.map("id", fields[0]);
                api.map("status", fields[7]);

                const payload = api.generateRegistrationPayload();
                if (!payload) throw new Error("No payload to send");

                const res = await fetch("/api/collection", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Failed to register");
                }

            } catch (err: any) {
                console.error("Failed to fetch/register:", err);
                setError(err.message);
            }
        }

        fetchAndRegister();
    }, [pb]);

    return (
        <>
            <h1>Apis</h1>
            {error && <p style={{ color: "red" }}>Error: {error}</p>}
            <pre>
                <code>{pretty}</code>
            </pre>
        </>
    );
}
