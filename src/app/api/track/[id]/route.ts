// Token-based tracking was replaced by customer accounts. This file is an inert leftover and can be deleted.
export const GET = () => new Response(JSON.stringify({ error: "Please log in to see your orders." }), { status: 410, headers: { "content-type": "application/json" } });
