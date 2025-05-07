import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

export async function GET() {
    try {
        const pb = new PocketBase("http://127.0.0.1:8090");

        const records = await pb.collection("alerts").getFullList();

        const alerts = records.map((record) => {
            return {
                id: record.id,
                name: record.name,
                enabled: record.enabled ?? true,
                created: record.created,
                updated: record.updated,
                condition: record.condition, // NOTE: Already JSON, keep raw for now
            };
        });

        return NextResponse.json({ success: true, alerts });
    } catch (error: any) {
        console.error("Error in GET /api/alerts:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
