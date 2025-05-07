import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const response = await fetch("https://www.timeapi.io/api/time/current/zone?timeZone=Europe%2FAthens");

        if (!response.ok) {
            throw new Error("Failed to fetch time data");
        }

        const data = await response.json();
        
        return NextResponse.json(data);

    } catch (error) {
        console.error("Error in GET /api/time:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
