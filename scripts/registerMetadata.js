const apiEndpoint = 'https://discord.com/api/';

const botToken = process.argv.at(-1);
const botId = Buffer.from(botToken.split('.')[0], 'base64').toString(); // а че мне

await fetch(`${apiEndpoint}/applications/${botId}/role-connections/metadata`, {
	method: 'PUT',
	headers: {
		'Authorization': `Bot ${botToken}`,
		'Content-Type': 'application/json'
	},
	body: JSON.stringify([
		{
			name: 'скушано кала',
			description: 'сколько человек покушал кала',
			key: 'kal',
			type: 2
		},
		{
			name: 'сделано престижей',
			description: 'сколько человек сделал престижей',
			key: 'prestige_level',
			type: 2
		}
	])
}).then((res) => res.json()).then(console.log);