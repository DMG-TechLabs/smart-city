"use client";

import React, { useEffect, useState } from "react";
import PocketBase from "pocketbase";

type Alert = {
  id: string;
  name: string;
  interval?: number;
  enabled?: boolean;
  condition?: any;
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

export default function AlertHistory() {
  const [alerts, setAlerts] = useState<AlertHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pb = new PocketBase("http://127.0.0.1:8090"); // Change if needed
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
    <div className="main-content flex justify-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Alert History</h1>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : alerts.length === 0 ? (
          <p className="text-center">No alerts found.</p>
        ) : (
          <div className="overflow-x-auto rounded border border-gray-300 shadow-sm">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border-b">Alert Name</th>
                  <th className="p-3 border-b">Condition</th>
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
                      <td className="p-3 border-b text-gray-600">
                        {new Date(record.created).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
