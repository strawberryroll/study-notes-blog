const ALG = { name: "HMAC", hash: "SHA-256" } satisfies HmacImportParams

export const ADMIN_SESSION_COOKIE = "admin_session"
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set")
  return secret
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    ALG,
    false,
    ["sign", "verify"]
  )
}

function base64url(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function base64urlToBytes(str: string): Uint8Array<ArrayBuffer> {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/")
  const binary = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="))
  const bytes = new Uint8Array(new ArrayBuffer(binary.length))
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export async function signSession(ttlSeconds: number): Promise<string> {
  const payload = JSON.stringify({ exp: Date.now() + ttlSeconds * 1000 })
  const payloadB64 = base64url(new TextEncoder().encode(payload))
  const key = await getKey()
  const signature = await crypto.subtle.sign(ALG, key, new TextEncoder().encode(payloadB64))
  return `${payloadB64}.${base64url(new Uint8Array(signature))}`
}

export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token) return false

  const [payloadB64, sigB64] = token.split(".")
  if (!payloadB64 || !sigB64) return false

  const key = await getKey()
  const valid = await crypto.subtle.verify(
    ALG,
    key,
    base64urlToBytes(sigB64),
    new TextEncoder().encode(payloadB64)
  )
  if (!valid) return false

  try {
    const { exp } = JSON.parse(new TextDecoder().decode(base64urlToBytes(payloadB64)))
    return typeof exp === "number" && Date.now() < exp
  } catch {
    return false
  }
}
