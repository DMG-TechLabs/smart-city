import { NextResponse } from 'next/server';
import { abort } from 'node:process';

export async function GET(req: Request) {
    return NextResponse.json({
        root: "/api",
        endpoints: [
            {
                path: "/alerts",
                desc: "Returns the list of all defined alerts",
            },
            {
                path: "/alerts/history",
                desc: "Returns the list of all past alert triggers",
            },
            {
                path: "/help",
                desc: "Returns this response",
            },
            {
                path: "/ping",
                desc: "pong",
            },
            {
                path: "/providers",
                desc: "Returns the list of active providers",
            },
            {
                path: "/time",
                desc: "Returns the current time (Europe/Athens)",
            },
            {
                path: "/weather",
                desc: "Returns the current weather in Thessaloniki Greece",
            }
        ]
    });
}

