import type PocketBase from 'pocketbase';
import { AlertCondition } from "./AlertCondition";

export type AlertCallback = (alert: Alert) => void;

export class Alert {
    id: string | undefined; // Auto assigned
    name: string;
    interval: number;
    condition: AlertCondition;
    lastTriggered: number | null = null;
    enabled: boolean = true;
    callback?: AlertCallback;

    constructor(
        name: string,
        interval: number,
        condition: AlertCondition,
        callback?: AlertCallback
    ) {
        this.name = name;
        this.interval = interval;
        this.condition = condition;
        this.callback = callback;
    }

    check(data: Record<string, any>): void {
        if (!this.enabled) return;

        const currentTime = Date.now();
        if (this.lastTriggered && currentTime - this.lastTriggered < this.interval) {
            return;
        }

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

    disable(): void {
        // TODO: update db
        this.enabled = false;
    }

    enable(): void {
        // TODO: update db
        this.enabled = true;
    }

    async push(pb: PocketBase): Promise<boolean> {
        try {
            await pb.collection('alerts').create({
                name: this.name,
                interval: this.interval,
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
        return new Alert(record.name, record.interval, condition, record.callback);
    }
}
