export type AlertCondition = {
    field: string;          // e.g., "temperature"
    operator: ">" | "<" | "==" | ">=" | "<=" | "!=";
    value: number;          // e.g., 30
};

export type AlertCallback = (alert: Alert) => void;

export class Alert {
    id: string;
    name: string;
    interval: number; // milliseconds
    condition: AlertCondition;
    lastTriggered: number | null = null;
    enabled: boolean = true;
    callback?: AlertCallback;

    constructor(
        id: string,
        name: string,
        interval: number,
        condition: AlertCondition,
        callback?: AlertCallback
    ) {
        this.id = id;
        this.name = name;
        this.interval = interval;
        this.condition = condition;
        this.callback = callback;
    }

    /**
     * Call this method periodically with new data to evaluate the condition.
     */
    check(data: Record<string, any>): void {
        if (!this.enabled) return;

        const currentTime = Date.now();
        if (
            this.lastTriggered &&
            currentTime - this.lastTriggered < this.interval
        ) {
            return;
        }

        const value = data[this.condition.field];

        if (value === undefined) return;

        const conditionMet = this.evaluate(value);
        if (conditionMet) {
            this.lastTriggered = currentTime;
            this.trigger();
        }
    }

    private evaluate(value: number): boolean {
        const { operator, value: conditionValue } = this.condition;
        switch (operator) {
            case ">": return value > conditionValue;
            case "<": return value < conditionValue;
            case "==": return value === conditionValue;
            case ">=": return value >= conditionValue;
            case "<=": return value <= conditionValue;
            case "!=": return value !== conditionValue;
            default: return false;
        }
    }

    private trigger(): void {
        console.log(`Alert "${this.name}" triggered!`);
        if (this.callback) {
            this.callback(this);
        }
    }

    disable(): void {
        this.enabled = false;
    }

    enable(): void {
        this.enabled = true;
    }
}
