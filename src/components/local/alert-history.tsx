"use client"

import React, { useEffect, useState } from "react";
import PocketBase from "pocketbase";
import { usePocketBase } from "@/context/DatabaseContext";

type Alert = {
    id: string;
    name: string;
    interval?: number;
    enabled?: boolean;
    condition?: any;
    severity: "low" | "medium" | "high";
};

type AlertHistoryRecord = {
    id: string;
    collection: string;
    recordId: string;
    created: string;
    expand?: {
        alert?: Alert;
    };
};

type Condition =
    | {
        field: string;
        operator: string;
        value: any;
    }
    | {
        operator: string;
        conditions: Condition[];
    };


function formatCondition(cond: any): string {
    if (!cond) return "—";

    if (Array.isArray(cond)) {
        return cond.map(formatCondition).join(" AND ");
    }

    if ("conditions" in cond && "operator" in cond) {
        return cond.conditions
            .map((c: any) => `${formatCondition(c)}`)
            .join(` ${cond.operator} `);
    }

    if ("field" in cond && "operator" in cond) {
        return `${cond.field} ${cond.operator} ${JSON.stringify(cond.value)}`;
    }

    return JSON.stringify(cond); // fallback for unknown structure
}
export function LocalAlertTable(newClassName: string = "") {
    const pb = usePocketBase();
    const [loading, setLoading] = useState(true);
    const [alerts, setAlerts] = useState<AlertHistoryRecord[]>([]);

    useEffect(() => {

        pb.collection("alertsHistory")
            .getFullList<AlertHistoryRecord>({
                sort: "-created",
                expand: "alert",
            })
            .then((records) => {
                setAlerts(records);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch alerts:", err);
                setLoading(false);
            });
    }, []);

    return (
        <div>
            {
                loading ? (
                    <p className="text-center" > Loading...</p>
                ) : alerts.length === 0 ? (
                    <p className="text-center">No alerts found.</p>
                ) : (
                    <div 
                        
                        className={"overflow-x-auto rounded border border-gray-300 shadow-s " + newClassName}
                        >
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 border-b">Alert Name</th>
                                    <th className="p-3 border-b">Condition</th>
                                    <th className="p-3 border-b">Severity</th>
                                    <th className="p-3 border-b">Triggered</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alerts.map((record) => {
                                    const alert = record.expand?.alert;
                                    return (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="p-3 border-b">{alert?.name ?? "—"}</td>
                                            <td className="p-3 border-b whitespace-pre-wrap max-w-sm">
                                                {alert?.condition
                                                    ? formatCondition(alert.condition)
                                                    : "—"}
                                            </td>
                                            <td className="p-3 border-b">
                                                {alert?.severity}
                                            </td>
                                            <td className="p-3 border-b text-gray-600">
                                                {new Date(record.created).toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )
            }</div>
    )
}
