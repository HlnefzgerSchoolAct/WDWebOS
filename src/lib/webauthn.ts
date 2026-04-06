import type { StudentProfile, WebAuthnCredentialRecord } from './localAuth'

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

type CborValue =
  | null
  | boolean
  | number
  | bigint
  | string
  | Uint8Array
  | CborValue[]
  | Map<string | number, CborValue>

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const normalized = `${value.replaceAll('-', '+').replaceAll('_', '/')}${'='.repeat(
    (4 - (value.length % 4)) % 4,
  )}`
  const binary = atob(normalized)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return asArrayBufferView(bytes)
}

function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return asArrayBufferView(bytes)
}

async function sha256(bytes: ArrayBuffer | Uint8Array): Promise<Uint8Array<ArrayBuffer>> {
  const buffer = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  return new Uint8Array(await crypto.subtle.digest('SHA-256', asArrayBufferView(buffer)))
}

function concatBytes(...chunks: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const combined = new Uint8Array(totalLength)
  let offset = 0

  for (const chunk of chunks) {
    combined.set(chunk, offset)
    offset += chunk.length
  }

  return asArrayBufferView(combined)
}

function asArrayBufferView(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  return bytes as Uint8Array<ArrayBuffer>
}

async function profileToUserId(profile: StudentProfile): Promise<Uint8Array<ArrayBuffer>> {
  const normalized = `${profile.name.trim().toLowerCase()}|${profile.grade}|${profile.lunchPeriod}`
  return sha256(textEncoder.encode(normalized))
}

class CborReader {
  private readonly view: DataView

  private offset = 0

  private readonly bytes: Uint8Array<ArrayBuffer>

  constructor(bytes: Uint8Array) {
    this.bytes = asArrayBufferView(bytes)
    this.view = new DataView(this.bytes.buffer, this.bytes.byteOffset, this.bytes.byteLength)
  }

  readValue(): CborValue {
    const initialByte = this.readUint8()
    const majorType = initialByte >> 5
    const additionalInfo = initialByte & 0x1f

    switch (majorType) {
      case 0:
        return this.readLength(additionalInfo)
      case 1:
        return -1 - this.readLength(additionalInfo)
      case 2:
        return this.readBytes(this.readLength(additionalInfo))
      case 3:
        return textDecoder.decode(this.readBytes(this.readLength(additionalInfo)))
      case 4: {
        const length = this.readLength(additionalInfo)
        const values: CborValue[] = []

        for (let index = 0; index < length; index += 1) {
          values.push(this.readValue())
        }

        return values
      }
      case 5: {
        const length = this.readLength(additionalInfo)
        const values = new Map<string | number, CborValue>()

        for (let index = 0; index < length; index += 1) {
          const key = this.readValue()
          const normalizedKey = typeof key === 'string' || typeof key === 'number' ? key : String(key)
          values.set(normalizedKey, this.readValue())
        }

        return values
      }
      case 6:
        this.readLength(additionalInfo)
        return this.readValue()
      case 7:
        switch (additionalInfo) {
          case 20:
            return false
          case 21:
            return true
          case 22:
          case 23:
            return null
          case 24:
            return this.readUint8()
          case 25:
            return this.readHalfFloat()
          case 26:
            return this.view.getFloat32(this.advance(4))
          case 27:
            return this.view.getFloat64(this.advance(8))
          default:
            throw new Error('Unsupported CBOR simple value.')
        }
      default:
        throw new Error('Unsupported CBOR value.')
    }
  }

  private readLength(additionalInfo: number): number {
    if (additionalInfo < 24) {
      return additionalInfo
    }

    switch (additionalInfo) {
      case 24:
        return this.readUint8()
      case 25:
        return this.readUint16()
      case 26:
        return this.readUint32()
      case 27: {
        const length = this.readBigUint64()

        if (length > BigInt(Number.MAX_SAFE_INTEGER)) {
          throw new Error('CBOR value is too large.')
        }

        return Number(length)
      }
      default:
        throw new Error('Invalid CBOR length.')
    }
  }

  private readBytes(length: number): Uint8Array {
    const start = this.offset
    const end = start + length
    this.offset = end
    return this.bytes.slice(start, end)
  }

  private readUint8(): number {
    const value = this.view.getUint8(this.offset)
    this.offset += 1
    return value
  }

  private readUint16(): number {
    const value = this.view.getUint16(this.offset)
    this.offset += 2
    return value
  }

  private readUint32(): number {
    const value = this.view.getUint32(this.offset)
    this.offset += 4
    return value
  }

  private readBigUint64(): bigint {
    const value = this.view.getBigUint64(this.offset)
    this.offset += 8
    return value
  }

  private advance(length: number): number {
    const start = this.offset
    this.offset += length
    return start
  }

  private readHalfFloat(): number {
    const value = this.readUint16()
    const sign = value & 0x8000 ? -1 : 1
    const exponent = (value & 0x7c00) >> 10
    const fraction = value & 0x03ff

    if (exponent === 0) {
      return sign * (fraction / 1024) * 2 ** -14
    }

    if (exponent === 0x1f) {
      return fraction === 0 ? sign * Number.POSITIVE_INFINITY : Number.NaN
    }

    return sign * (1 + fraction / 1024) * 2 ** (exponent - 15)
  }
}

function parseCbor(bytes: Uint8Array<ArrayBuffer>): CborValue {
  return new CborReader(bytes).readValue()
}

function parseAttestationObject(attestationObject: ArrayBuffer): Uint8Array<ArrayBuffer> {
  const parsed = parseCbor(new Uint8Array(attestationObject))

  if (!(parsed instanceof Map)) {
    throw new Error('Invalid attestation object.')
  }

  const authData = parsed.get('authData')

  if (!(authData instanceof Uint8Array)) {
    throw new Error('Invalid attestation data.')
  }

  return asArrayBufferView(authData)
}

function parseAuthenticatorData(authData: Uint8Array<ArrayBuffer>): {
  signCount: number
  publicKeyCose: Map<string | number, CborValue>
} {
  if (authData.length < 37) {
    throw new Error('Authenticator data is too short.')
  }

  const flags = authData[32]

  if ((flags & 0x40) === 0) {
    throw new Error('Authenticator data is missing attested credential data.')
  }

  let offset = 37
  offset += 16

  const credentialIdLength = new DataView(authData.buffer, authData.byteOffset + offset, 2).getUint16(0)
  offset += 2 + credentialIdLength

  const parsedKey = parseCbor(authData.slice(offset))

  if (!(parsedKey instanceof Map)) {
    throw new Error('Invalid public key data.')
  }

  return {
    signCount: new DataView(authData.buffer, authData.byteOffset + 33, 4).getUint32(0),
    publicKeyCose: parsedKey,
  }
}

function publicKeyToJwk(publicKeyCose: Map<string | number, CborValue>): {
  algorithm: -7 | -257
  publicKeyJwk: JsonWebKey
} {
  const kty = publicKeyCose.get(1)
  const alg = publicKeyCose.get(3)

  if (kty === 2) {
    const crv = publicKeyCose.get(-1)
    const x = publicKeyCose.get(-2)
    const y = publicKeyCose.get(-3)

    if (!(x instanceof Uint8Array) || !(y instanceof Uint8Array)) {
      throw new Error('Invalid EC key coordinates.')
    }

    if (crv !== 1) {
      throw new Error('Only P-256 keys are supported right now.')
    }

    return {
      algorithm: alg === -257 ? -257 : -7,
      publicKeyJwk: {
        kty: 'EC',
        crv: 'P-256',
        x: bytesToBase64Url(x),
        y: bytesToBase64Url(y),
        ext: true,
      },
    }
  }

  if (kty === 3) {
    const modulus = publicKeyCose.get(-1)
    const exponent = publicKeyCose.get(-2)

    if (!(modulus instanceof Uint8Array) || !(exponent instanceof Uint8Array)) {
      throw new Error('Invalid RSA key parameters.')
    }

    return {
      algorithm: -257,
      publicKeyJwk: {
        kty: 'RSA',
        n: bytesToBase64Url(modulus),
        e: bytesToBase64Url(exponent),
        ext: true,
      },
    }
  }

  throw new Error('Unsupported WebAuthn key type.')
}

async function importWebAuthnKey(record: WebAuthnCredentialRecord): Promise<CryptoKey> {
  if (record.publicKeyJwk.kty === 'EC') {
    return crypto.subtle.importKey(
      'jwk',
      record.publicKeyJwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify'],
    )
  }

  if (record.publicKeyJwk.kty === 'RSA') {
    return crypto.subtle.importKey(
      'jwk',
      record.publicKeyJwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    )
  }

  throw new Error('Unsupported public key type.')
}

export function isWebAuthnSupported(): boolean {
  return typeof window !== 'undefined' && Boolean(window.PublicKeyCredential)
}

export async function createRegistrationOptions(
  profile: StudentProfile,
): Promise<PublicKeyCredentialCreationOptions> {
  return {
    challenge: asArrayBufferView(randomBytes(32)),
    rp: {
      name: 'WDWebOS',
      id: window.location.hostname,
    },
    user: {
      id: await profileToUserId(profile),
      name: profile.name,
      displayName: `${profile.name} - Grade ${profile.grade}`,
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 },
      { type: 'public-key', alg: -257 },
    ],
    timeout: 60_000,
    attestation: 'none',
    authenticatorSelection: {
      authenticatorAttachment: 'cross-platform',
      residentKey: 'discouraged',
      requireResidentKey: false,
      userVerification: 'required',
    },
  }
}

export async function extractCredentialRecord(
  credential: PublicKeyCredential,
): Promise<WebAuthnCredentialRecord> {
  if (!(credential.response instanceof AuthenticatorAttestationResponse)) {
    throw new Error('Expected a WebAuthn attestation response.')
  }

  const authData = parseAttestationObject(credential.response.attestationObject)
  const parsedAuthData = parseAuthenticatorData(authData)
  const { algorithm, publicKeyJwk } = publicKeyToJwk(parsedAuthData.publicKeyCose)

  return {
    credentialId: bytesToBase64Url(asArrayBufferView(new Uint8Array(credential.rawId))),
    publicKeyJwk,
    algorithm,
    signCount: parsedAuthData.signCount,
  }
}

export async function createAssertionOptions(
  credentialId: string,
): Promise<PublicKeyCredentialRequestOptions> {
  return {
    challenge: asArrayBufferView(randomBytes(32)),
    allowCredentials: [
      {
        id: asArrayBufferView(base64UrlToBytes(credentialId)),
        type: 'public-key',
      },
    ],
    timeout: 60_000,
    userVerification: 'required',
  }
}

export async function verifyAssertionResponse(
  credentialRecord: WebAuthnCredentialRecord,
  assertion: PublicKeyCredential,
  expectedChallenge: Uint8Array,
): Promise<{ verified: boolean; signCount: number }> {
  if (!(assertion.response instanceof AuthenticatorAssertionResponse)) {
    throw new Error('Expected a WebAuthn assertion response.')
  }

  const clientDataBytes = asArrayBufferView(new Uint8Array(assertion.response.clientDataJSON))
  const clientData = JSON.parse(textDecoder.decode(clientDataBytes)) as {
    type?: string
    challenge?: string
    origin?: string
  }

  if (clientData.type !== 'webauthn.get') {
    throw new Error('Unexpected WebAuthn response type.')
  }

  if (clientData.origin !== window.location.origin) {
    throw new Error('WebAuthn origin mismatch.')
  }

  if (clientData.challenge !== bytesToBase64Url(expectedChallenge)) {
    throw new Error('WebAuthn challenge mismatch.')
  }

  const authenticatorData = asArrayBufferView(new Uint8Array(assertion.response.authenticatorData))
  const clientDataHash = await sha256(clientDataBytes)
  const signedData = concatBytes(authenticatorData, clientDataHash)
  const signature = asArrayBufferView(new Uint8Array(assertion.response.signature))
  const publicKey = await importWebAuthnKey(credentialRecord)

  const verified = await crypto.subtle.verify(
    credentialRecord.publicKeyJwk.kty === 'RSA'
      ? { name: 'RSASSA-PKCS1-v1_5' }
      : { name: 'ECDSA', hash: 'SHA-256' },
    publicKey,
    signature,
    signedData,
  )

  const signCount = new DataView(authenticatorData.buffer, authenticatorData.byteOffset + 33, 4).getUint32(0)

  return {
    verified,
    signCount,
  }
}

export function buildAuthenticatedRecord(params: {
  profile: StudentProfile
  credential: WebAuthnCredentialRecord
}): {
  profile: StudentProfile
  credential: WebAuthnCredentialRecord
  trustedDevice: boolean
  createdAt: string
  updatedAt: string
} {
  const now = new Date().toISOString()

  return {
    profile: params.profile,
    credential: params.credential,
    trustedDevice: true,
    createdAt: now,
    updatedAt: now,
  }
}