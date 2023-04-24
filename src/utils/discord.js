import { apiEndpoint, updateOauthToken } from './';

export const interactionType = {
	Ping: 1,
	ApplicationCommand: 2,
	MessageComponent: 3,
	ApplicationCommandAutocomplete: 4,
	ModalSumbit: 5
}

export const interactionResponseType = {
	Pong: 1,
	ChannelMessageWithSource: 4,
	DefferedChannelMessageWithSource: 5,
	DefferedUpdateMessage: 6,
	UpdateMessage: 7,
	ApplicationCommandAutocompleteResult: 8,
	Modal: 9
}

export const componentType = {
	ActionRow: 1,
	Button: 2,
	StringSelect: 3,
	TextInput: 4,
	UserSelect: 5,
	RoleSelect: 6,
	MentionableSelect: 7,
	ChannelSelect: 8
}

export const buttonStyle = {
	primary: 1,
	secondary: 2,
	success: 3,
	danger: 4,
	link: 5
}

async function _fetch(path, options) {
	const response = await fetch(`${apiEndpoint}${path}`, options);
	if (!response.ok) throw response.statusText;

	return response.json();
}

export function getOauthUser(accessToken) {
	return _fetch('/users/@me', {
		headers: {
			'Authorization': accessToken
		}
	});
}

export async function getOauthToken(code, redirectUrl, env) {
	return _fetch('/oauth2/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			client_id: env.DISCORD_OAUTH2_CLIENT_ID,
			client_secret: env.DISCORD_OAUTH2_CLIENT_SECRET,
			grant_type: 'authorization_code',
			redirect_uri: redirectUrl,
			code
		})
	});
}

export async function refreshOauthToken(refreshToken, env) {
	return _fetch('/oauth2/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			client_id: env.DISCORD_OAUTH2_CLIENT_ID,
			client_secret: env.DISCORD_OAUTH2_CLIENT_SECRET,
			grant_type: 'refresh_token',
			refresh_token: refreshToken
		})
	});
}

export async function revokeToken(data, accessToken, env) {
	return _fetch('/oauth2/token/revoke', {
		method: 'POST',
		headers: {
			'Authorization': accessToken,
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			client_id: env.DISCORD_OAUTH2_CLIENT_ID,
			client_secret: env.DISCORD_OAUTH2_CLIENT_SECRET,
			token: data.access_token
		})
	})
}

export async function getAccessToken(userId, env) {
	const { value, metadata } = await env.KV.getWithMetadata(`token:${userId}`, { type: 'json' });
	if (!value) return null;

	if (metadata?.expires < Date.now()) {
		const data = await refreshOauthToken(value.refreshToken, env);
		const accessToken = `${data.token_type} ${data.access_token}`;

		await updateOauthToken(userId, accessToken, data, env);
		return accessToken;
	}

	return value.accessToken;
}

export async function updateMetadata(accessToken, kal, prestigeLevel, env) {
	return _fetch(`/users/@me/applications/${env.DISCORD_OAUTH2_CLIENT_ID}/role-connection`, {
		method: 'PUT',
		headers: {
			'Authorization': accessToken,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ metadata: { kal, prestige_level: prestigeLevel } })
	});
}

export async function createFollowUp(interaction, data) {
	return _fetch(`/webhooks/${interaction.application_id}/${interaction.token}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});
}

export function formatRelativeTimestamp(timestamp) {
	return `<t:${~~(timestamp / 1000)}:R>`;
}