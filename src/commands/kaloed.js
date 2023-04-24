import { interactionResponseType } from '../utils/';

export default {
	name: 'kaloed',
	async handle() {
		return {
			type: interactionResponseType.ChannelMessageWithSource,
			data: {
				content: `команда на курорте отстань от неё`,
			}
		}
	}
}