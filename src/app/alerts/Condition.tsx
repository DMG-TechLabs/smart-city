export type Condition = {
    collection: string;
    field: string;          // e.g., "temperature"
    operator: ">" | "<" | "==" | ">=" | "<=" | "!=";
    value: number;          // e.g., 30
};

export type LogicalOperator = "AND" | "OR";

