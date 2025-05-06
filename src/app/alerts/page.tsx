"use client";

import React, { useEffect } from "react";
import { usePocketBase } from "@/context/DatabaseContext";
import { Alert } from "./Alert";
import { AlertCondition } from "./AlertCondition";
import AlertUI from "./AlertUI";

export default function Alerts() {
    const pb = usePocketBase();
    useEffect(() => {
        const condition = new AlertCondition()
            .add({ field: "temperature", operator: ">", value: 40 })
            .add(new AlertCondition("OR").add({ field: "humidity", operator: "<", value: 50 }));


        const json = JSON.stringify(condition.toJSON());
        console.log(json);

        const alert = new Alert(
            "High Temp Alert",
            50000,
            condition,
            (alert) => {
                console.log(`${alert.name} triggered`);
            }
        );

        alert.push(pb);

    }, [pb]);

    return (
        <>
            <AlertUI />
        </>
    );
}
