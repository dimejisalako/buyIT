// The waitlist has been removed. This file is an inert leftover and can be deleted.
const gone = () => new Response(JSON.stringify({ error: "The waitlist is closed." }), { status: 410, headers: { "content-type": "application/json" } });

export const GET = gone;
export const POST = gone;
