import {
	interactionResponseType,
	formatRelativeTimestamp,
	componentType,
	buttonStyle,
	interactionType,
	createRemind,
	kalEatCooldown,
	kalPrestigeCooldown,
	createFollowUp,
	getKal,
	updateKal,
	maxPrestigeLevel
} from '../utils/';

// какой ужас

export default {
	name: 'kal',
	handle(t, interaction, env, ctx) {
		if (interaction.type === interactionType.ApplicationCommand) {
			return this.handleCommand(t, interaction, env, ctx);
		}

		return this.handleComponent(t, interaction, env, ctx);
	},
	async handleCommand(t, interaction, env, ctx) {
		const data = await getKal(interaction.member.user.id, env);

		switch (interaction.data.options[0].name) {
			case 'eat': {
				if (data.coolDown > Date.now()) {
					return {
						type: interactionResponseType.ChannelMessageWithSource,
						data: {
							content: t('kal.cooldown', formatRelativeTimestamp(data.coolDown)),
							flags: 64
						}
					};
				}
				
				const total = data.prestigeLevel + data.kal + 1;
				const prestigeRequired = 5 + 7 * data.prestigeLevel;
				const coolDown = Date.now() + kalEatCooldown;

				await updateKal(interaction.member.user.id, total, data.prestigeLevel, coolDown, env, ctx);

				return {
					type: interactionResponseType.ChannelMessageWithSource,
					data: {
						content: t('kal.eat.success', total, formatRelativeTimestamp(coolDown)),
						components: [
							{
								type: componentType.ActionRow,
								components: [
									{
										type: componentType.Button,
										style: buttonStyle.Secondary,
										label: t('remind'),
										custom_id: `kal:remind:${coolDown}:${interaction.member.user.id}`
									},
									{
										type: componentType.Button,
										style: buttonStyle.Secondary,
										label: data.prestigeLevel >= maxPrestigeLevel ? t('no') : prestigeRequired <= total ? t('kal.eat.canPrestige') : t('kal.eat.prestigeRemain', prestigeRequired - total),
										custom_id: 'kal:remain',
										disabled: true
									}
								]
							}
						]
					}
				};
			}
		
			case 'prestige': {
				if (data.prestigeLevel >= maxPrestigeLevel) {
					return {
						type: interactionResponseType.ChannelMessageWithSource,
						data: {
							content: t('kal.prestige.max', maxPrestigeLevel),
							flags: 64
						}
					};
				}

				const required = 5 + 7 * data.prestigeLevel;

				if (data.kal < required) {
					return {
						type: interactionResponseType.ChannelMessageWithSource,
						data: {
							content: t('kal.prestige.invalid', required),
							flags: 64
						}
					};
				}

				const coolDown = Date.now() + kalPrestigeCooldown;
				await updateKal(interaction.member.user.id, 0, ++data.prestigeLevel, coolDown, env, ctx);

				return {
					type: interactionResponseType.ChannelMessageWithSource,
					data: {
						content: t('kal.prestige.success', data.prestigeLevel, formatRelativeTimestamp(coolDown)),
						components: [
							{
								type: componentType.ActionRow,
								components: [
									{
										type: componentType.Button,
										style: buttonStyle.Secondary,
										label: t('remind'),
										custom_id: `kal:remind:${coolDown}:${interaction.member.user.id}`
									}
								]
							}
						]
					}
				};
			}
		}
	},
	handleComponent(t, interaction, env, ctx) {
		const [, , coolDown, userId] = interaction.data.custom_id.split(':');
		if (interaction.member.user.id !== userId) {
			return {
				type: interactionResponseType.DefferedUpdateMessage
			};
		}

		if (coolDown > Date.now()) {
			ctx.waitUntil(createRemind(userId, +coolDown, env).then(key => createFollowUp(interaction, { content: t(key), flags: 64 })));
		}

		return {
			type: interactionResponseType.UpdateMessage,
			data: { components: [] }
		};
	}
};