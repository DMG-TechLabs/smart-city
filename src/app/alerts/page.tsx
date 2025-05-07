"use client";

import { usePocketBase } from "../../context/DatabaseContext.tsx";
import { Alert } from "./Alert.tsx";
import { useEffect, useState } from "react";
import { AlertUI } from "./AlertUI.tsx";

export default function Alerts() {
    const pb = usePocketBase();
    const [alerts, setAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        async function fetchAlerts(): Promise<void> {
            const loadedAlerts = await Alert.loadAlerts(pb);
            setAlerts(loadedAlerts);
        }

        fetchAlerts();
    }, [pb]);

    return (
        <div>
            <h1>Alerts</h1>
            <div>
                {alerts.map((alert, index) => (
                    <div key={alert.id ?? index}>
                        <AlertUI alert={alert}/>
                    </div>
                ))}
            </div>
        </div>
    );
}

