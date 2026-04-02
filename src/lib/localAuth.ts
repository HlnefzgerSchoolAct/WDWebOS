export type StudentProfile = {
  name: string
  grade: '9' | '10' | '11' | '12'
  lunchPeriod: 'A lunch' | 'B lunch' | 'C lunch'
}

export type StoredAuthRecord = {
  profile: StudentProfile
  passwordHash: string
}

export const STORAGE_KEY = 'wdwebos.localAuth.v1'
const PASSWORD_SALT = 'wdwebos.onboarding.2026'

const encoder = new TextEncoder()

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function hashPassword(rawPassword: string): Promise<string> {
  const normalized = `${PASSWORD_SALT}:${rawPassword}`
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(normalized))
  return bytesToHex(new Uint8Array(digest))
}

export function getStoredAuthRecord(): StoredAuthRecord | null {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredAuthRecord>

    if (
      typeof parsed?.passwordHash !== 'string' ||
      typeof parsed?.profile?.name !== 'string' ||
      !['9', '10', '11', '12'].includes(String(parsed?.profile?.grade)) ||
      !['A lunch', 'B lunch', 'C lunch'].includes(String(parsed?.profile?.lunchPeriod))
    ) {
      return null
    }

    return {
      passwordHash: parsed.passwordHash,
      profile: {
        name: parsed.profile.name,
        grade: parsed.profile.grade as StudentProfile['grade'],
        lunchPeriod: parsed.profile.lunchPeriod as StudentProfile['lunchPeriod'],
      },
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