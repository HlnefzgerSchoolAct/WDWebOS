import type { WebAuthnCredentialRecord } from './localAuth'

function parseJsonWebKey(rawValue: string): JsonWebKey | null {
  try {
    const parsed = JSON.parse(rawValue) as JsonWebKey

    if (typeof parsed !== 'object' || parsed === null || typeof parsed.kty !== 'string') {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function getConfiguredMasterKey(): WebAuthnCredentialRecord | null {
  const credentialId = import.meta.env.VITE_MASTER_KEY_CREDENTIAL_ID as string | undefined
  const rawPublicKey = import.meta.env.VITE_MASTER_KEY_PUBLIC_KEY_JWK as string | undefined
  const rawAlgorithm = import.meta.env.VITE_MASTER_KEY_ALGORITHM as string | undefined
  const rawSignCount = import.meta.env.VITE_MASTER_KEY_SIGN_COUNT as string | undefined

  if (!credentialId || !rawPublicKey) {
    return null
  }

  const publicKeyJwk = parseJsonWebKey(rawPublicKey)

  if (!publicKeyJwk) {
    return null
  }

  const algorithm = rawAlgorithm === '-257' ? -257 : -7
  const signCount = rawSignCount ? Number(rawSignCount) : 0

  if (!Number.isFinite(signCount) || signCount < 0) {
    return null
  }

  return {
    credentialId,
    publicKeyJwk,
    algorithm,
    signCount,
  }
}
