"use client";

import { usePocketBase } from "../../context/DatabaseContext.tsx";
import { Alert } from "./Alert";
import { AlertCondition } from "./AlertCondition";
import { useEffect } from "react";


export default function Alerts() {
    const pb = usePocketBase();
    useEffect(() => {
        async function registerAlert() {
            // NOTE: Building the Alert should be the responsibility of the user
            const ac = new AlertCondition("AND")
                .add({ field: "temperature", operator: ">", value: 25 })
                .add(new AlertCondition("OR")
                    .add({ field: "humidity", operator: "<", value: 30 })
                    .add({ field: "status", operator: "==", value: "warning" }));

            const alert = new Alert("High Temp Alert", ac);

            try {
                pb.send("/api/addalert", {
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
    }, [pb]); // run once on mount

    return (
        <>
            <h1>Alerts</h1>
        </>
    );
}
