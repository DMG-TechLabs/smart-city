"use client";

import { usePocketBase } from "@/context/DatabaseContext.tsx";
import { Alert } from "../Alert";
import { AlertCondition } from "../AlertCondition";
import { useEffect, useState } from "react";

export default function AlertsAdd() {
  const pb = usePocketBase();

  useEffect(() => {
    async function registerAlert() {
      const ac = new AlertCondition("AND")
        .add({ field: "temperature", operator: ">", value: 25 })
        .add(
          new AlertCondition("OR")
            .add({ field: "humidity", operator: "<", value: 30 })
            .add({ field: "status", operator: "==", value: "warning" })
        );

      const alert = new Alert("New Alert", ac);

      try {
        await pb.send("/api/addalert", {
          query: {
            name: alert.name,
            condition: JSON.stringify(ac.toJSON()),
          },
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
            <h1>Alerts Add</h1>
        </>
    );
}
