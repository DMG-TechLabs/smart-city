type Field = {
    path: string,
    type: string
};

export class Api {
    provider: string;
    endpoint: string;
    private mappings: Map<string, Field> = new Map();

    constructor(
        provider: string,
        endpoint: string
    ) {
        this.provider = provider;
        this.endpoint = endpoint;
    }

    async call(): Promise<any> {
        const response = await fetch(this.endpoint);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const json = await response.json();
        return json;
    }

    static extractFirst(json: any): any {
        const dataToShow = Array.isArray(json) && typeof json[0] === "object"
            ? json[0]
            : json;

        return dataToShow;
    }

    static prettify(json: any): string {
        return JSON.stringify(this.extractFirst(json), null, 2);
    }

    map(field: Field): void {
        const segments = field.path.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1];
        this.mappings.set(lastSegment, field);
    }

    private tableName(): string {
        return "api_" + this.provider;
    }

    private inferPocketBaseType(value: any): string {
        const type = typeof value;

        switch (type) {
            case "string":
                return "text";
            case "number":
                return "number";
            case "boolean":
                return "bool";
            case "object":
                if (value instanceof Date) return "date";
            if (Array.isArray(value)) return "json";
            if (value === null) return "json";
            return "json";
            default:
                return "json";
        }
    }

    extractFields(obj: any, basePath = ""): Field[] {
        const fields: Field[] = [];

        for (const key in obj) {
            const value = obj[key];
            const path = `${basePath}/${key}`.replace(/^\/+/, "/");

            if (value !== null && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
                fields.push(...this.extractFields(value, path));
            } else {
                fields.push({
                    path,
                    type: this.inferPocketBaseType(value)
                });
            }
        }

        return fields;
    }

    async delete(pb: PocketBase): Promise<boolean> {
        try {
            const records = await pb.collection("metadata").getFullList({
                filter: `provider="${this.provider}"`,
            });

            if (records.length > 0) {
                await pb.collection("metadata").delete(records[0].id);
            }

            return true;
        } catch (error) {
            console.error("Failed to delete provider data:", error);
            return false;
        }
    }

    generateRegistrationPayload(): object | null {
        if(this.mappings.size == 0) return null;

        const fields = [];
        const paths = [];

        for (const [key, value] of this.mappings.entries()) {
            fields.push({
                name: key,
                type: value?.type || "text",
                required: false,
                unique: false,
                options: {},
            });

            paths.push({
                name: (key == "id") ? this.provider + "_pb_" + key : key,
                path: value?.path || "",
            });
        }

        const collection = {
            name: this.tableName(),
            type: "base",
            system: true,
            schema: fields,
            createRule: "@request.user.id != null",
            listRule: "@request.user.id != null",
            viewRule: "@request.user.id != null",
            updateRule: "@request.user.id != null",
            deleteRule: null,
        };

        return {
            provider: this.provider,
            endpoint: this.endpoint,
            collection: collection,
            paths: paths
        }
    }

    static async loadApis(pb: PocketBase): Promise<Api[]> {
        try {
            const records = await pb.collection("metadata").getFullList({ sort: "-created" });
            return records.map((record: any) => new Api(record.provider, record.endpoint));
        } catch (err) {
            console.error("Failed to load APIs:", err);
            return [];
        }
    }
}
