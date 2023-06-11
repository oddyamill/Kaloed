export function emptyResponse(init) {
	return new Response(null, init);
}

export function jsonResponse(body) {
	// может потом сделать Response.json просто зачем это говно
	return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
}