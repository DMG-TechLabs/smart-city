import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

export async function POST(req: Request) {
    const pb = new PocketBase("http://127.0.0.1:8090");

    try {
        await pb.admins.authWithPassword("kdesp2003@gmail.com", "12345678");

        const { provider, collection, endpoint, paths } = await req.json();

        if (!provider || !collection || !endpoint || !paths) {
            return NextResponse.json({ success: false, message: "Missing required data" }, { status: 400 });
        }

        const createdCollection = await pb.collections.create(collection);

        const metadata = await pb.collection("metadata").create({
            provider: provider, 
            endpoint: endpoint,
            paths: JSON.stringify(paths),
        });

        return NextResponse.json({
            success: true,
            collection: createdCollection,
            metadata
        });

    } catch (error: any) {
        console.error("Error creating collection:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Unknown error" },
            { status: 500 }
        );
    }
}
