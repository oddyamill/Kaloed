import { getAccessToken, updateMetadata } from '.';

export async function getKal(userId, env) {
	const { value, metadata } = await env.KV.getWithMetadata(`kal:${userId}`, { type: 'json' });

	return {
		kal: value?.kal ?? 0,
		prestigeLevel: value?.prestigeLevel ?? 0,
		coolDown: metadata?.coolDown ?? 0
	}
}

export async function updateKal(userId, kal, prestigeLevel, coolDown, env, ctx) {
	const accessToken = await getAccessToken(userId, env);
	if (accessToken !== null) ctx.waitUntil(updateMetadata(accessToken, kal, prestigeLevel, env));

	await env.KV.put(`kal:${userId}`, JSON.stringify({ kal, prestigeLevel }), { metadata: { coolDown } });
}

export async function updateOauthToken(userId, accessToken, data, env) {
	const expires = Date.now() + data.expires_in * 1000;

	await env.KV.put(`token:${userId}`, JSON.stringify({ accessToken, refreshToken: data.refresh_token }), { metadata: { expires } });
}