"use client";

import { usePocketBase } from "@/context/DatabaseContext.tsx";
import { Alert } from "./Alert.tsx";
import { useEffect, useState } from "react";
import { AlertUI } from "./AlertUI.tsx";
import { ScrollArea } from "@/components/ui/scroll-area";

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

    async function deleteAlert(alert: Alert) {
        const success = await alert.delete(pb);
        if (success) {
            setAlerts(prev => prev.filter(a => a.id !== alert.id));
        }
    }

    async function editAlert(alert: Alert) {
        const success = await alert.update(pb);
        if (success) {
            setAlerts(prev =>
                prev.map(a => (a.id === alert.id ? alert : a))
            );
        }
    }

    return (
        <div className="flex justify-center w-full">
            <div className="text-center mt-8">
                <h1 className="text-2xl font-bold mb-4">Alerts</h1>
                <ScrollArea className="h-full w-[50vw] max-h-[80vh] rounded-md border p-4">
                    {alerts.map((alert, index) => (
                        <div key={alert.id ?? index}>
                            <AlertUI alert={alert} onDelete={() => deleteAlert(alert)} onEdit={() => editAlert(alert)}/>
                        </div>
                    ))}
                </ScrollArea>
            </div>
        </div>
    );
}
