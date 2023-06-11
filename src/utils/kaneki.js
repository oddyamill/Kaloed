export async function createRemind(userId, endTimestamp, env) {
	const response = await fetch(env.KANEKI_URL, {
		method: 'POST',
		headers: {
			'Authorization': env.KANEKI_AUTH,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ user_id: userId, end: endTimestamp })
	});

	return response.ok ? 'remindCreated' : 'remindFail';
}