import {
	interactionResponseType,
	formatRelativeTimestamp,
	embedColor,
	componentType,
	buttonStyle,
	interactionType,
	createRemind,
	kalEatCooldown,
	kalPrestigeCooldown,
	createFollowUp,
	getKal,
	updateKal
} from '../utils/';

// какой ужас

export default {
	name: 'kal',
	async handle(interaction, env, ctx) {
		const data = await getKal(interaction.member.user.id, env);

		switch (interaction.type) {
			case interactionType.ApplicationCommand: {
				switch (interaction.data.options[0].name) {
					case 'eat': {
						if (data.coolDown > Date.now()) {
							return {
								type: interactionResponseType.ChannelMessageWithSource,
								data: {
									content: `кулдаун. жди. сможешь. покушать. лакомство. ${formatRelativeTimestamp(data.coolDown)}`,
									flags: 64
								}
							}
						}
				
						const total = data.prestigeLevel + data.kal + 1;
						const coolDown = Date.now() + kalEatCooldown;

						await updateKal(interaction.member.user.id, total, data.prestigeLevel, coolDown, env, ctx);

						return {
							type: interactionResponseType.ChannelMessageWithSource,
							data: {
								content: `ты покушал кал уже получается скушал всего ${total}\nснова сможешь покушать ${formatRelativeTimestamp(coolDown)}`,
								components: [
									{
										type: componentType.ActionRow,
										components: [
											{
												type: componentType.Button,
												style: buttonStyle.secondary,
												label: 'напомните мне',
												custom_id: `kal:remind:${coolDown}:${interaction.member.user.id}`
											},
											{
												type: componentType.Button,
												style: buttonStyle.secondary,
												label: data.prestigeLevel === 19 ? 'нет' : (5 + 7 * data.prestigeLevel) <= total ? 'вы можете совернить престиж' : `до престижа: ${(5 + 7 * data.prestigeLevel) - total} калоедств`,
												custom_id: 'kal:remain',
												disabled: true
											}
										]
									}
								]
							}
						}
					}
		
					case 'prestige': {
						if (data.prestigeLevel >= 19) {
							return {
								type: interactionResponseType.ChannelMessageWithSource,
								data: {
									content: 'все пока 19 престижей максимум',
									flags: 64
								}
							}
						}

						const required = 5 + 7 * data.prestigeLevel;

						if (data.kal < required) {
							return {
								type: interactionResponseType.ChannelMessageWithSource,
								data: {
									content: `для совершения престижа нужно ${required} калоедств иди копи`,
									flags: 64
								}
							}
						}

						const coolDown = Date.now() + kalPrestigeCooldown;
						await updateKal(interaction.member.user.id, 0, ++data.prestigeLevel, coolDown, env, ctx);
		
						return {
							type: interactionResponseType.ChannelMessageWithSource,
							data: {
								content: `престиж совершен теперь ${data.prestigeLevel} престижей ВСЕГО\nкал сможешь кстати покушать ${formatRelativeTimestamp(coolDown)}`,
								components: [
									{
										type: componentType.ActionRow,
										components: [
											{
												type: componentType.Button,
												style: buttonStyle.secondary,
												label: 'напомните мне',
												custom_id: `kal:remind:${coolDown}:${interaction.member.user.id}`
											}
										]
									}
								]
							}
						}
					}
		
					case 'info': {
						return {
							type: interactionResponseType.ChannelMessageWithSource,
							data: {
								content: 'функция поедания кала',
								embeds: [
									{
										title: `</kal eat:${interaction.data.id}>`,
										description: 'вы можете покушать кал. для чего? вы можете получать роли. за что? за количество скушаного вами кала.',
										color: embedColor
									},
									{
										title: `</kal prestige:${interaction.data.id}>`,
										description: 'вы можете сделать престиж и получать больше кала за раз классно да получается я тоже так думаю',
										color: embedColor
									},
									{
										title: 'kaloedstvo (в контекстном меню)',
										description: 'покажет сколько человек скушал кала с момента последнего престижа',
										image: { url: 'https://cdn.discordapp.com/attachments/977572991854592021/1080862632820609084/image.png' },
										color: embedColor
									}
								]
							}
						}
					}
				}
			}

			case interactionType.MessageComponent: {
				const [, , coolDown, userId] = interaction.data.custom_id.split(':');
				if (interaction.member.user.id !== userId) {
					return {
						type: interactionResponseType.DefferedUpdateMessage
					}
				}

				if (coolDown > Date.now()) {
					ctx.waitUntil(createRemind(userId, +coolDown, env).then((res) => createFollowUp(interaction, { content: res.status === 201 ? 'напоминание создано жди придет когда то там' : 'не могу создать личку открой', flags: 64 })))
				}

				return {
					type: interactionResponseType.UpdateMessage,
					data: { components: [] }
				}
			}
		}
	}
}