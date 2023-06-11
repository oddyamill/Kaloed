import { interactionResponseType } from '../utils/';

export default {
	name: 'kaloed',
	async handle(t) {
		return {
			type: interactionResponseType.ChannelMessageWithSource,
			data: {
				content: t('kaloed.success'),
			}
		};
	}
};