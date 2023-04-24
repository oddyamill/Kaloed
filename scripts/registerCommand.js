const apiEndpoint = 'https://discord.com/api/';

const clientId = process.argv.at(-2);
const clientSecret = process.argv.at(-1);

const data = await fetch(`${apiEndpoint}/oauth2/token`, {
	method: 'POST',
	body: new URLSearchParams({
		'grant_type': 'client_credentials',
		'scope': 'applications.commands.update'
	}),
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
	}
}).then((res) => res.json());

console.log(data, `${data.token_type} ${data.access_token}`)

await fetch(`${apiEndpoint}/applications/${clientId}/guilds/1048626759874134076/commands`, {
	method: 'POST',
	body: JSON.stringify({
		name: 'kal',
		description: 'кал',
		type: 1,
		options: [
			{ description: 'покушать кал', type: 1, name: 'eat' },
			{ description: 'сделать престиж', type: 1, name: 'prestige' },
			{ description: 'информация о кале', type: 1, name: 'info' }
		]
	}),
	headers: {
		'Content-Type': 'application/json',
		'Authorization': `${data.token_type} ${data.access_token}`
	}
}).then((res) => res.json()).then(console.log);