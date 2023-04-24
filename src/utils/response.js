export function emptyResponse(init) {
	return new Response(null, init);
}

export function jsonResponse(body) {
	return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
}