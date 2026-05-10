function getBrowserCrypto(): Crypto | null {
  return typeof globalThis.crypto !== 'undefined' ? globalThis.crypto : null
}

function createRandomHex(length: number): string {
  const browserCrypto = getBrowserCrypto()

  if (browserCrypto?.getRandomValues) {
    const values = new Uint8Array(length)
    browserCrypto.getRandomValues(values)
    return Array.from(values, (value) => value.toString(16).padStart(2, '0')).join('')
  }

  let value = ''
  for (let index = 0; index < length; index += 1) {
    value += Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  }

  return value
}

export function createClientId(): string {
  const browserCrypto = getBrowserCrypto()

  if (browserCrypto?.randomUUID) {
    return browserCrypto.randomUUID()
  }

  return [
    createRandomHex(4),
    createRandomHex(2),
    createRandomHex(2),
    createRandomHex(2),
    createRandomHex(6),
  ].join('-')
}
