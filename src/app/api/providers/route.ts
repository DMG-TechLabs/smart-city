import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { Api } from '@/app/providers/Api';

export async function GET() {
    try {
        const pb = new PocketBase("http://127.0.0.1:8090");

        const records = await pb.collection("metadata").getFullList();

        const providers = records.map((record) => {
            return {
                id: record.id,
                name: record.provider,
                endpoint: record.endpoint,
                created: record.created,
                updated: record.updated,
            };
        });

        return NextResponse.json({ success: true, providers });
    } catch (error: any) {
        console.error("Error in GET /api/providers:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    const pb = new PocketBase("http://127.0.0.1:8090");

    try {
        const { provider, endpoint, paths } = await req.json();

        if (!provider || !endpoint || !paths) {
            return NextResponse.json(
                { success: false, message: "Missing required data" },
                { status: 400 }
            );
        }

        console.log(paths);

        const api = new Api(provider, endpoint);
        const json = await api.call();
        const fields = api.extractFields(Api.extractFirst(json));

        for (const field of fields) {
            console.log("Checking field: ", field);
            if (paths.includes(field.path)) {
                console.log("Added field: ", field);
                api.map(field);
            }
        }

        // const payload = api.generateRegistrationPayload();
        const payload = api.generateRegistrationPayload();

        if (!payload) {
            throw new Error("No payload to send");
        }

        console.log("Payload:", JSON.stringify(payload));

        const res = await pb.send("/api/createcollection", {
            method: "POST",
            query: {
                payload: payload
            },
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to register");
        }

        await pb.collection("metadata").create({
            provider,
            endpoint,
            paths: payload.paths,
        });

        console.log("Collection and metadata registered successfully");

        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error("Failed to fetch/register:", err);
        return NextResponse.json(
            { success: false, message: err.message || "Internal error" },
            { status: 500 }
        );
    }
}
