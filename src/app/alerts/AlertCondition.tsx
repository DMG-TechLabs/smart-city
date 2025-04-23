import { Condition, LogicalOperator } from './Condition';

export class AlertCondition {
    private conditions: (Condition | AlertCondition)[] = [];
    private operator: LogicalOperator;

    constructor(operator: LogicalOperator = "AND") {
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
            } else {
                const fieldValue = data[c.field];
                if (fieldValue === undefined) return false;

                switch (c.operator) {
                    case ">": return fieldValue > c.value;
                    case "<": return fieldValue < c.value;
                    case "==": return fieldValue === c.value;
                    case ">=": return fieldValue >= c.value;
                    case "<=": return fieldValue <= c.value;
                    case "!=": return fieldValue !== c.value;
                    default: return false;
                }
            }
        });

        if (this.operator === "AND") {
            return results.every(Boolean);
        } else {
            return results.some(Boolean);
        }
    }

    toJSON(): { operator: LogicalOperator; conditions: any[] } {
        return {
            operator: this.operator,
            conditions: this.conditions.map((c) =>
                c instanceof AlertCondition ? c.toJSON() : c
            ),
        };
    }

    static fromJSON(obj: any): AlertCondition {
        const ac = new AlertCondition(obj.operator);
        for (const c of obj.conditions) {
            if (c.operator && c.conditions) {
                ac.add(AlertCondition.fromJSON(c));
            } else {
                ac.add(c as Condition);
            }
        }
        return ac;
    }
}
