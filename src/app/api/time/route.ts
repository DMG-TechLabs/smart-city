import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const key = process.env.TIME_API_KEY;
    try {
        const response = await fetch("https://api.timezonedb.com/v2.1/get-time-zone?by=zone&zone=Europe%2FAthens&format=json&key=" + key);

        if (!response.ok) {
            throw new Error("Failed to fetch time data");
        }

        const data = await response.json();
        
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Error in GET /api/time:", error);
        return NextResponse.json(
            { 
                error: error.message || "Internal Server Error",
                status: 500
            }
        );
    }
}
