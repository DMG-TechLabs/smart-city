import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

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

