import type { WebAuthnCredentialRecord } from './localAuth'

function normalizeEnvValue(value: string): string {
  const trimmed = value.trim()

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim()
  }

  return trimmed
}

function parseJsonWebKey(rawValue: string): JsonWebKey | null {
  try {
    const parsed = JSON.parse(normalizeEnvValue(rawValue)) as JsonWebKey

    if (typeof parsed !== 'object' || parsed === null || typeof parsed.kty !== 'string') {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export type ConfiguredMasterKey = WebAuthnCredentialRecord & {
  rpId?: string
}

export function getConfiguredMasterKey(): ConfiguredMasterKey | null {
  const rawCredentialId = import.meta.env.VITE_MASTER_KEY_CREDENTIAL_ID as string | undefined
  const rawPublicKey = import.meta.env.VITE_MASTER_KEY_PUBLIC_KEY_JWK as string | undefined
  const rawAlgorithm = import.meta.env.VITE_MASTER_KEY_ALGORITHM as string | undefined
  const rawSignCount = import.meta.env.VITE_MASTER_KEY_SIGN_COUNT as string | undefined
  const rawRpId = import.meta.env.VITE_MASTER_KEY_RP_ID as string | undefined

  const credentialId = rawCredentialId ? normalizeEnvValue(rawCredentialId) : ''
  const rpId = rawRpId ? normalizeEnvValue(rawRpId).toLowerCase() : undefined

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
    rpId,
  }
}
