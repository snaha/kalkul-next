const DEFAULT_RANDOM_BASE = 36

function defaultGetRandomValues(bytes: Uint8Array) {
	return crypto.getRandomValues<Uint8Array>(bytes)
}

export function generateRandomString(
	randomBytesLength: number,
	base: 10 | 16 | 36 = DEFAULT_RANDOM_BASE,
	getRandomValues: (bytes: Uint8Array) => Uint8Array = defaultGetRandomValues,
) {
	const zeroBytes = new Uint8Array(randomBytesLength)
	const bytes = getRandomValues(zeroBytes)
	const bytesHex = bytes.reduce((o, v) => o + ('00' + v.toString(16)).slice(-2), '')
	return BigInt('0x' + bytesHex).toString(base)
}
