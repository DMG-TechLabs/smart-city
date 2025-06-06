import type PocketBase from 'pocketbase';
import { AlertCondition } from "./AlertCondition";
import { RecordModel } from 'pocketbase';

export class Alert {
    id: string | undefined; // Auto assigned
    name: string;
    condition: AlertCondition | null;
    enabled: boolean = true;
    severity: "low" | "medium" | "high";

    constructor(name: string, condition: AlertCondition | object, severity: "low" | "medium" | "high") {
        this.name = name;
        this.condition = condition instanceof AlertCondition
            ? condition
            : AlertCondition.fromJSON(condition);
        this.severity = severity;
    }

    async update(pb: PocketBase): Promise<boolean> {
        if(this.id == null) {
            console.error("Alert ID is null");
            return false;
        }
        try {
            await pb.collection("alerts").update(this.id, {
                name: this.name,
                condition: JSON.stringify(this.condition?.toJSON()),
                enabled: this.enabled,
            });
        } catch(err) {
            console.error("Failed to update alert:", err)
            return false;
        }
        return true;
    }

    async disable(pb: PocketBase): Promise<boolean> {
        this.enabled = false;
        return await this.update(pb);
    }

    async enable(pb: PocketBase): Promise<boolean> {
        this.enabled = true;
        return await this.update(pb);
    }

    async push(pb: PocketBase): Promise<boolean> {
        if(this.condition == null) return false;
        return await Alert.push(pb, this.name, JSON.stringify(this.condition.toJSON()));
    }

    static async push(pb: PocketBase, name: string, json: string): Promise<boolean> {
        try {
            await pb.collection('alerts').create({
                name: name,
                condition: json,
                enabled: true
            });
            return true;
        } catch (err) {
            console.error('Failed to push alert:', err);
            return false;
        }
    }

    static fromPBRecord(record: RecordModel): Alert {
        console.log(record.condition);
        const condition = AlertCondition.fromJSON(record.condition);
        if(condition == null) throw new Error("Condition is null");
        const alert = new Alert(record.name, condition, record.severity);
        alert.id = record.id;
        alert.enabled = record.enabled;
        return alert;
    }

    static async loadAlerts(pb: PocketBase): Promise<Alert[]> {
        try {
            const records = await pb.collection("alerts").getFullList({ sort: "-created" });
            return records.map(record => Alert.fromPBRecord(record));
        } catch (err) {
            console.error("Failed to load alerts:", err);
            return [];
        }
    }
    async delete(pb: PocketBase): Promise<boolean> {
        if (!this.id) {
            console.error("No alert ID provided for deletion.");
            return false;
        }

        try {
            await pb.collection("alerts").delete(this.id);
            return true;
        } catch (err) {
            console.error("Failed to delete alert:", err);
            return false;
        }
    }
}
