import type PocketBase from 'pocketbase';
import { AlertCondition } from "./AlertCondition";

export type AlertCallback = (alert: Alert) => void;

export class Alert {
    id: string | undefined; // Auto assigned
    name: string;
    condition: AlertCondition;
    lastTriggered: number | null = null;
    enabled: boolean = true;
    callback?: AlertCallback;

    constructor(
        name: string,
        condition: AlertCondition,
        callback?: AlertCallback
    ) {
        this.name = name;
        this.condition = condition;
        this.callback = callback;
    }

    check(data: Record<string, any>): void {
        if (!this.enabled) return;

        const currentTime = Date.now();
        const conditionMet = this.condition.evaluate(data);

        if (conditionMet) {
            this.lastTriggered = currentTime;
            this.trigger();
        }
    }

    private trigger(): void {
        if (this.callback) {
            this.callback(this);
        }
    }

    private async update(pb: PocketBase): Promise<boolean> {
        if(this.id == null) {
            console.error("Alert ID is null");
            return false;
        }
        try {
            await pb.collection("alerts").update(this.id, {
                name: this.name,
                condition: JSON.stringify(this.condition.toJSON()),
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
        try {
            await pb.collection('alerts').create({
                name: this.name,
                condition: JSON.stringify(this.condition.toJSON()),
                enabled: this.enabled,
            });
            return true;
        } catch (err) {
            console.error('Failed to push alert:', err);
            return false;
        }
    }

    static fromPBRecord(record: any): Alert {
        const condition = AlertCondition.fromJSON(JSON.parse(record.condition));
        return new Alert(record.name, condition, record.callback);
    }
}
