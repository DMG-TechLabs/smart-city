export type Condition = {
    field: string;          // e.g., "temperature"
    operator: ">" | "<" | "==" | ">=" | "<=" | "!=";
    value: number;          // e.g., 30
};

export type LogicalOperator = "AND" | "OR";

