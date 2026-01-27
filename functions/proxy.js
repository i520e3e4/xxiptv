export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);

    // Handle preflight requests
    if (request.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "*"
            },
        });
    }

    const targetUrlStr = url.searchParams.get("url");
    if (!targetUrlStr) {
        return new Response("Missing 'url' query parameter", { status: 400 });
    }

    try {
        const targetUrl = new URL(targetUrlStr);
        const newRequest = new Request(targetUrl, request);

        // Remove headers that might cause issues
        newRequest.headers.delete("Host");
        newRequest.headers.delete("Referer");
        newRequest.headers.delete("Origin");
        newRequest.headers.delete("CF-Connecting-IP");

        const response = await fetch(newRequest);

        // Create a new response with CORS headers
        const newResponse = new Response(response.body, response);
        newResponse.headers.set("Access-Control-Allow-Origin", "*");
        newResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        newResponse.headers.set("Access-Control-Allow-Headers", "*");

        return newResponse;
    } catch (e) {
        return new Response(`Proxy Error: ${e.message}`, { status: 500 });
    }
}
