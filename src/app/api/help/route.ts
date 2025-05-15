import { NextResponse } from 'next/server';
import { abort } from 'node:process';

export async function GET(req: Request) {
    return NextResponse.json({
        root: "/api",
        endpoints: [
            {
                path: "/alerts",
                desc: "Returns the list of all defined alerts",
                auth: true
            },
            {
                path: "/alerts/history",
                desc: "Returns the list of all past alert triggers",
                auth: true
            },
            {
                path: "/help",
                desc: "Returns this response",
                auth: false
            },
            {
                path: "/ping",
                desc: "pong",
                auth: false
            },
            {
                path: "/providers",
                desc: "Returns the list of active providers",
                auth: true
            },
            {
                path: "/time",
                desc: "Returns the current time (Athens/Greece)",
                auth: false
            },
            {
                path: "/weather",
                desc: "Returns the current weather in Thessaloniki Greece",
                auth: false
            }
        ]
    });
}

