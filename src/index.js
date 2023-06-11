import { 
	emptyResponse,
	jsonResponse,
	interactionType, 
	interactionResponseType,
	getOauthToken,
	commands,
	authorizedOauthUrl,
	getOauthUser,
	updateOauthToken,
	updateMetadata,
	oauthScopes,
	getKal,
	translator,
	verify
} from './utils/';

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		switch (`${request.method}${url.pathname}`) {
			case 'POST/webhook': {
				const signature = request.headers.get('x-signature-ed25519');
				const timestamp = request.headers.get('x-signature-timestamp');
				if (!signature || !timestamp) return emptyResponse({ status: 400 });
		
				const isValid = await verify(request, signature, timestamp, env.DISCORD_PUBLIC_KEY);
				if (!isValid) return emptyResponse({ status: 401 });
		
				const interaction = await request.json();
		
				if (interaction.type === interactionType.Ping) {
					return jsonResponse({ type: interactionResponseType.Pong });
				}
		
				const name = interaction.data?.name ?? interaction.data?.custom_id;
				if (!name) return emptyResponse({ status: 400 });

				const t = translator(interaction.locale);
		
				const command = commands.find((command) => name.split(':')[0] === command.name);
				if (!command) return jsonResponse({ type: interactionResponseType.ChannelMessageWithSource, data: { content: t('invalid') } });

				return jsonResponse(await command.handle(t, interaction, env, ctx));
			}

			case 'GET/authorize': {
				const code = url.searchParams.get('code');
				if (!code) return emptyResponse({ status: 400 });

				const data = await getOauthToken(code, url.origin + url.pathname, env);
				const accessToken = `${data.token_type} ${data.access_token}`;

				if (oauthScopes.some(s => !data.scope.includes(s))) {
					return emptyResponse({ status: 403 });
				}

				const user = await getOauthUser(accessToken);
				const { kal, prestigeLevel } = await getKal(user.id, env);

				ctx.waitUntil(updateOauthToken(user.id, accessToken, data, env));
				ctx.waitUntil(updateMetadata(accessToken, kal, prestigeLevel, env));

				return emptyResponse({ status: 301, headers: { 'Location': authorizedOauthUrl } });
			}

			case 'GET/kal': {
				const userId = url.searchParams.get('user_id');
				if (!userId) return emptyResponse({ status: 400 });

				return jsonResponse(await getKal(userId, env));
			}

			default: 
				return emptyResponse({ status: 404 });
		}
	}
};