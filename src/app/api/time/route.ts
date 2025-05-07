import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const response = await fetch("https://www.timeapi.io/api/time/current/zone?timeZone=Europe%2FAthens");
    const data = await response.json();

    return NextResponse.json(data);
}
