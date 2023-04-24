export function createRemind(userId, endTimestamp, env) {
	return fetch(env.KANEKI_URL, {
		method: 'POST',
		headers: {
			'Authorization': env.KANEKI_AUTH,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ user_id: userId, end: endTimestamp })
	});
}