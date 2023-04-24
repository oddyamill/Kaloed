// с гитхаба взял умный да эту вот функцию
function hexToBin(hex) {
	const buffer = new Uint8Array(Math.ceil(hex.length / 2));

	for (let i = 0; i < buffer.length; i++) {
		buffer[i] = parseInt(hex.substr(i * 2, 2), 16);
	}

	return buffer;
}

const encoder = new TextEncoder();

export async function verify(request, signature, timestamp, publicKey) {
	const key = await crypto.subtle.importKey('raw', hexToBin(publicKey), { name: 'NODE-ED25519', namedCurve: 'NODE-ED25519' }, false, ['verify']);
	const body = await request.clone().text();

	return crypto.subtle.verify('NODE-ED25519', key, hexToBin(signature), encoder.encode(timestamp + body));
}