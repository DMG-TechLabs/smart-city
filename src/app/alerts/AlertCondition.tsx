import { Condition, LogicalOperator } from './Condition';

function isCondition(obj: any): obj is Condition {
    return (
        obj &&
        typeof obj.field === "string" &&
        typeof obj.operator === "string" &&
        "value" in obj
    );
}

function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

export class AlertCondition {
    private conditions: (Condition | AlertCondition)[] = [];
    private operator: LogicalOperator;

    constructor(operator: LogicalOperator = "&&") {
        if (operator !== "&&" && operator !== "||") {
            throw new Error(`Invalid logical operator: ${operator}`);
        }
        this.operator = operator;
    }

    add(condition: Condition | AlertCondition): this {
        this.conditions.push(condition);
        return this;
    }

    /**
     * Evaluate the entire condition chain against input data
     */
    evaluate(data: Record<string, any>): boolean {
        const results = this.conditions.map((c) => {
            if (c instanceof AlertCondition) {
                return c.evaluate(data);
            } else if (isCondition(c)) {
                const fieldValue = getNestedValue(data, c.field);
                if (fieldValue === undefined) return false;

                switch (c.operator) {
                    case ">": return fieldValue > c.value;
                    case "<": return fieldValue < c.value;
                    case "==": return fieldValue === c.value;
                    case ">=": return fieldValue >= c.value;
                    case "<=": return fieldValue <= c.value;
                    case "!=": return fieldValue !== c.value;
                    default: throw new Error(`Unsupported operator: ${c.operator}`);
                }
            }
            return false;
        });

        return this.operator === "&&" ? results.every(Boolean) : results.some(Boolean);
    }

    toJSON(): { operator: LogicalOperator; conditions: any[] } {
        return {
            operator: this.operator,
            conditions: this.conditions.map((c) =>
                c instanceof AlertCondition ? c.toJSON() : c
            ),
        };
    }

    static fromJSON(obj: any): AlertCondition | null {
        if(obj == null) return null;
        const ac = new AlertCondition(obj.operator);
        for (const c of obj.conditions) {
            if (c.operator && Array.isArray(c.conditions)) {
                const condition = AlertCondition.fromJSON(c);
                if(condition != null)
                    ac.add(condition);
            } else if (isCondition(c)) {
                ac.add(c);
            } else {
                throw new Error("Invalid condition structure in JSON");
            }
        }
        return ac;
    }

    toString(): string {
        return this.conditions
            .map((c) =>
                c instanceof AlertCondition
                    ? `(${c.toString()})`
                    : `${c.field} ${c.operator} ${JSON.stringify(c.value)}`
            )
            .join(this.operator === "&&"
                ? " AND "
                : this.operator === "||"
                ? " OR "
                : ` ${this.operator} `);
    }

    static toString(json): string {
    }
}
