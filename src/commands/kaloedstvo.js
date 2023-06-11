import { getKal, interactionResponseType } from '../utils/';

export default {
	name: 'kaloedstvo',
	async handle(t, interaction, env) {
		const user = interaction.data.resolved.users[interaction.data.target_id];

		if (user.bot) {
			return {
				type: interactionResponseType.ChannelMessageWithSource,
				data: {
					content: 'это бот боты не могут кал кушать потому что',
					flags: 64
				}
			};
		}

		const { kal } = await getKal(user.id, env);

		return {
			type: interactionResponseType.ChannelMessageWithSource,
			data: {
				content: t('kaloedstvo.success', user.username, kal)
			}
		};
	}
};