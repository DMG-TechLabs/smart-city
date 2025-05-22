"use client";

import { LocalAlertTable } from "@/components/local/alert-history";

export default function AlertHistory() {
  

  

  return (
    <div className="main-content flex justify-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Alert History</h1>
        <LocalAlertTable />
      </div>
    </div>
  );
}
