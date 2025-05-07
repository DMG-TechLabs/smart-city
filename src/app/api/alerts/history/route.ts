import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch("http://127.0.0.1:8090/api/getalerthistory");

        if (!response.ok) {
            throw new Error(`Failed to fetch history: ${response.statusText}`);
        }

        const data = await response.json();

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("Error in GET /api/alerts/history:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
