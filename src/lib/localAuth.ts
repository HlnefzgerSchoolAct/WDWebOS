export type StudentProfile = {
  name: string
  grade: '9' | '10' | '11' | '12'
  lunchPeriod: 'A lunch' | 'B lunch' | 'C lunch'
}

export type WebAuthnCredentialRecord = {
  credentialId: string
  publicKeyJwk: JsonWebKey
  algorithm: -7 | -257
  signCount: number
}

export type StoredAuthRecord = {
  profile: StudentProfile
  credential: WebAuthnCredentialRecord
  trustedDevice: boolean
  createdAt: string
  updatedAt: string
}

export const STORAGE_KEY = 'wdwebos.localAuth.v2'

export function getStoredAuthRecord(): StoredAuthRecord | null {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredAuthRecord>

    if (
      typeof parsed?.profile?.name !== 'string' ||
      !['9', '10', '11', '12'].includes(String(parsed?.profile?.grade)) ||
      !['A lunch', 'B lunch', 'C lunch'].includes(String(parsed?.profile?.lunchPeriod)) ||
      typeof parsed?.credential?.credentialId !== 'string' ||
      typeof parsed?.credential?.publicKeyJwk !== 'object' ||
      (parsed?.credential?.algorithm !== -7 && parsed?.credential?.algorithm !== -257) ||
      typeof parsed?.credential?.signCount !== 'number' ||
      typeof parsed?.trustedDevice !== 'boolean' ||
      typeof parsed?.createdAt !== 'string' ||
      typeof parsed?.updatedAt !== 'string'
    ) {
      return null
    }

    return {
      profile: {
        name: parsed.profile.name,
        grade: parsed.profile.grade as StudentProfile['grade'],
        lunchPeriod: parsed.profile.lunchPeriod as StudentProfile['lunchPeriod'],
      },
      credential: {
        credentialId: parsed.credential.credentialId,
        publicKeyJwk: parsed.credential.publicKeyJwk,
        algorithm: parsed.credential.algorithm,
        signCount: parsed.credential.signCount,
      },
      trustedDevice: parsed.trustedDevice,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    }
  } catch {
    return null
  }
}

export function saveAuthRecord(record: StoredAuthRecord): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
}

export function clearAuthRecord(): void {
  localStorage.removeItem(STORAGE_KEY)
}