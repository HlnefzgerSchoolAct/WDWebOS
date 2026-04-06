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

export type StudentAccount = {
  id: string
  profile: StudentProfile
  createdAt: string
  updatedAt: string
}

export type StoredAuthState = {
  accounts: StudentAccount[]
  activeAccountId: string | null
  trustedDevice: boolean
  createdAt: string
  updatedAt: string
}

export const STORAGE_KEY = 'wdwebos.localAuth.v2'

function createAccountId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `account-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function createStudentAccount(profile: StudentProfile): StudentAccount {
  const now = new Date().toISOString()

  return {
    id: createAccountId(),
    profile,
    createdAt: now,
    updatedAt: now,
  }
}

export function createInitialAuthState(params: {
  profile: StudentProfile
}): StoredAuthState {
  const now = new Date().toISOString()
  const account = createStudentAccount(params.profile)

  return {
    accounts: [account],
    activeAccountId: account.id,
    trustedDevice: true,
    createdAt: now,
    updatedAt: now,
  }
}

export function getActiveStudentAccount(state: StoredAuthState | null): StudentAccount | null {
  if (!state) {
    return null
  }

  if (!state.activeAccountId) {
    return state.accounts[0] ?? null
  }

  return state.accounts.find((account) => account.id === state.activeAccountId) ?? null
}

export function getActiveStudentProfile(state: StoredAuthState | null): StudentProfile | null {
  return getActiveStudentAccount(state)?.profile ?? null
}

export function upsertStudentAccount(
  state: StoredAuthState,
  profile: StudentProfile,
): StoredAuthState {
  const existingAccount = state.accounts.find((account) => {
    return (
      account.profile.name.toLowerCase() === profile.name.toLowerCase() &&
      account.profile.grade === profile.grade &&
      account.profile.lunchPeriod === profile.lunchPeriod
    )
  })

  if (existingAccount) {
    return {
      ...state,
      activeAccountId: existingAccount.id,
      updatedAt: new Date().toISOString(),
    }
  }

  const account = createStudentAccount(profile)

  return {
    ...state,
    accounts: [...state.accounts, account],
    activeAccountId: account.id,
    updatedAt: new Date().toISOString(),
  }
}

function isLegacyAuthRecord(value: Partial<StoredAuthState> & Record<string, unknown>): value is {
  profile: StudentProfile
  credential: WebAuthnCredentialRecord
  trustedDevice: boolean
  createdAt: string
  updatedAt: string
} {
  const profile = value.profile as Record<string, unknown> | undefined
  const credential = value.credential as Record<string, unknown> | undefined

  return (
    typeof profile?.name === 'string' &&
    typeof profile?.grade === 'string' &&
    typeof profile?.lunchPeriod === 'string' &&
    typeof credential?.credentialId === 'string' &&
    typeof credential?.publicKeyJwk === 'object' &&
    (credential?.algorithm === -7 || credential?.algorithm === -257) &&
    typeof credential?.signCount === 'number' &&
    typeof value.trustedDevice === 'boolean' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  )
}

export function getStoredAuthState(): StoredAuthState | null {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredAuthState> & Record<string, unknown>

    if (isLegacyAuthRecord(parsed)) {
      const account = createStudentAccount(parsed.profile)

      return {
        accounts: [account],
        activeAccountId: account.id,
        trustedDevice: parsed.trustedDevice,
        createdAt: parsed.createdAt,
        updatedAt: parsed.updatedAt,
      }
    }

    if (
      !Array.isArray(parsed?.accounts) ||
      parsed.accounts.some(
        (account) =>
          typeof account?.id !== 'string' ||
          typeof account?.profile?.name !== 'string' ||
          !['9', '10', '11', '12'].includes(String(account?.profile?.grade)) ||
          !['A lunch', 'B lunch', 'C lunch'].includes(String(account?.profile?.lunchPeriod)) ||
          typeof account?.createdAt !== 'string' ||
          typeof account?.updatedAt !== 'string',
      ) ||
      typeof parsed?.trustedDevice !== 'boolean' ||
      typeof parsed?.createdAt !== 'string' ||
      typeof parsed?.updatedAt !== 'string' ||
      (parsed?.activeAccountId !== null && typeof parsed?.activeAccountId !== 'string')
    ) {
      return null
    }

    return {
      accounts: parsed.accounts as StudentAccount[],
      activeAccountId: parsed.activeAccountId ?? null,
      trustedDevice: parsed.trustedDevice,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    }
  } catch {
    return null
  }
}

export function saveAuthState(state: StoredAuthState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearAuthState(): void {
  localStorage.removeItem(STORAGE_KEY)
}