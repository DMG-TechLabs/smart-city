import type PocketBase from 'pocketbase';

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

    async call(url: string): Promise<any> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const json = await response.json();
        return json;
    }

    map(name: string, field: Field): void {
        this.mappings.set(name, field);
    }

    private tableName(): string {
        return "api_" + this.provider;
    }

    async register(pb: PocketBase) {
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
                name: key,
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

        await pb.collection("collections").create(collection);
        await pb.collection("metadata").create({
            endpoint: this.endpoint,
            paths: JSON.stringify(paths),
        });
    }
}
