import PocketBase from "pocketbase";


export async function GET() {
    const pb = new PocketBase("http://127.0.0.1:8090");
    try {
        const result = await pb.collection("alertsHistory").getFullList(200 /* max limit */, {
            expand: "alert",
            sort: "-created",
        });

        const data = result.map((record) => ({
            id: record.id,
            collection: record.collection,
            recordId: record.recordId,
            created: record.created,
            updated: record.updated,
            alert: record.expand?.alert ?? null,
        }));

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Failed to fetch alertHistory:", error);
        return new Response(
            JSON.stringify({ error: "Failed to fetch alert history" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
