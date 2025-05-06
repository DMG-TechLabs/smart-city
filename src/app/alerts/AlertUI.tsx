"use client";

import React, { useState } from "react";
import { usePocketBase } from "@/context/DatabaseContext";
import { Alert } from "./Alert";
import { AlertCondition } from "./AlertCondition";
import styles from '@/styles/AlertUI.module.css';

const AlertUI = () => {
    const pb = usePocketBase();

    const [alertName, setAlertName] = useState<string>("");
    const [field, setField] = useState<string>("");
    const [operator, setOperator] = useState<string>(">");
    const [value, setValue] = useState<number>(0);
    const [interval, setInterval] = useState<number>(5000);
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [statusType, setStatusType] = useState<string>("statusInfo"); // default info
    const [conditionOperator, setConditionOperator] = useState<"AND" | "OR">("AND"); // AND/OR selection
    const [conditions, setConditions] = useState<any[]>([]); // For storing multiple conditions

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!alertName || !field || value === undefined) {
            setStatusMessage("Please fill in all fields.");
            setStatusType("statusError");
            return;
        }

        const condition = {
            field,
            operator: operator as ">" | "<" | "==" | ">=" | "<=" | "!=",
            value,
        };

        setConditions((prevConditions) => [...prevConditions, condition]);

        const newCondition = new AlertCondition(conditionOperator);
        conditions.forEach(cond => {
            newCondition.add(cond);
        });

        // Create the alert
        const alert = new Alert(alertName, interval, newCondition);

        try {
            const result = await alert.push(pb);
            if (result) {
                setStatusMessage("Alert created successfully!");
                setStatusType("statusSuccess");
            } else {
                setStatusMessage("Failed to create alert.");
                setStatusType("statusError");
            }
        } catch (error) {
            setStatusMessage("Error creating alert.");
            setStatusType("statusError");
        }
    };

    const handleAddCondition = () => {
        setConditions([...conditions, { field: "", operator: ">", value: 0 }]);
    };

    const handleConditionChange = (index: number, field: string, value: any) => {
        const updatedConditions = [...conditions];
        updatedConditions[index] = { ...updatedConditions[index], [field]: value };
        setConditions(updatedConditions);
    };

    return (
        <div className={styles.alertUi}>
            <h2 className={styles.header}>Create New Alert</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div>
                    <label htmlFor="alertName" className={styles.label}>Alert Name:</label>
                    <input
                        id="alertName"
                        className={styles.input}
                        type="text"
                        value={alertName}
                        onChange={(e) => setAlertName(e.target.value)}
                        required
                    />
                </div>
                
                <div>
                    <label htmlFor="interval" className={styles.label}>Interval (ms):</label>
                    <input
                        id="interval"
                        className={styles.input}
                        type="number"
                        value={interval}
                        onChange={(e) => setInterval(Number(e.target.value))}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="conditionOperator" className={styles.label}>Logical Operator:</label>
                    <select
                        id="conditionOperator"
                        className={styles.select}
                        value={conditionOperator}
                        onChange={(e) => setConditionOperator(e.target.value as "AND" | "OR")}
                    >
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                    </select>
                </div>

                {/* Conditions */}
                <div>
                    <h3>Conditions</h3>
                    {conditions.map((condition, index) => (
                        <div key={index} className={styles.conditionRow}>
                            <input
                                className={styles.input}
                                type="text"
                                placeholder="Field"
                                value={condition.field}
                                onChange={(e) => handleConditionChange(index, "field", e.target.value)}
                            />
                            <select
                                className={styles.select}
                                value={condition.operator}
                                onChange={(e) => handleConditionChange(index, "operator", e.target.value)}
                            >
                                <option value=">">></option>
                                <option value="<">&lt;</option>
                                <option value="==">==</option>
                                <option value=">=">≥</option>
                                <option value="<=">≤</option>
                                <option value="!=">≠</option>
                            </select>
                            <input
                                className={styles.input}
                                type="number"
                                value={condition.value}
                                onChange={(e) => handleConditionChange(index, "value", Number(e.target.value))}
                            />
                        </div>
                    ))}
                    <button type="button" className={styles.addButton} onClick={handleAddCondition}>
                        + Add Condition
                    </button>
                </div>

                <button type="submit" className={styles.button}>Create Alert</button>
            </form>
            
            {statusMessage && (
                <p className={`${styles.statusMessage} ${styles[statusType]}`}>
                    {statusMessage}
                </p>
            )}
        </div>
    );
};

export default AlertUI;
