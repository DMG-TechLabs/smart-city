import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const location = "Thessaloniki";
    const lang = "en";
    const key = process.env.WEATHER_API_KEY;


    const response = await fetch("https://api.weatherapi.com/v1/current.json?q=" + location + "&lang=" + lang + "&key=" + key);
    const data = await response.json();

    return NextResponse.json(data);
}
