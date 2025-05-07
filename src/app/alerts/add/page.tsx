"use client";

import { usePocketBase } from "@/context/DatabaseContext.tsx";
import { Alert } from "../Alert";
import { AlertCondition } from "../AlertCondition";
import { useEffect } from "react";
import { JsonSelector } from "@/components/local/json-selector";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AlertsAdd() {
    const pb = usePocketBase();
    useEffect(() => {
        async function registerAlert() {
            // NOTE: Building the Alert should be the responsibility of the user
            const ac = new AlertCondition("AND")
                .add({ field: "temperature", operator: ">", value: 25 })
                .add(new AlertCondition("OR")
                    .add({ field: "humidity", operator: "<", value: 30 })
                    .add({ field: "status", operator: "==", value: "warning" }));

            const alert = new Alert("New Alert", ac);

            try {
                await pb.send("/api/addalert", {
                    query: {
                        name: alert.name,
                        condition: JSON.stringify(ac.toJSON()),
                    }
                });

                console.log("Alert registered successfully");
            } catch (err) {
                console.error("Error registering alert:", err);
            }
        }

        registerAlert();
    }, [pb]);

    return (
        <>
            <h1>Alerts</h1>

            <ScrollArea className="h-full w-[50vw] max-h-[80vh] rounded-md border p-4">
                <JsonSelector
                    json={`{"status":"OK","message":"","countryCode":"GR","countryName":"Greece","regionName":"","cityName":"","zoneName":"Europe/Athens","abbreviation":"EEST","gmtOffset":10800,"dst":"1","zoneStart":1743296400,"zoneEnd":1761440399,"nextAbbreviation":"EET","timestamp":1746655310,"formatted":"2025-05-07 22:01:50"}`}
                    onFieldClick={(path, value) => alert(`${path}: ${JSON.stringify(value)}`)}
                />
            </ScrollArea>
        </>
    );
}

