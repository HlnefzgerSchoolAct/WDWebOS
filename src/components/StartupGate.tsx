import { type FormEvent, type ReactNode, useMemo, useState } from 'react'
import {
  type StudentProfile,
  createInitialAuthState,
  getStoredAuthState,
  saveAuthState,
} from '../lib/localAuth'
import { getConfiguredMasterKey } from '../lib/masterKey'
import {
  createAssertionOptions,
  isWebAuthnSupported,
  verifyAssertionResponse,
} from '../lib/webauthn'

type StartupGateProps = {
  children: ReactNode
}

const GRADE_OPTIONS: StudentProfile['grade'][] = ['9', '10', '11', '12']
const LUNCH_OPTIONS: StudentProfile['lunchPeriod'][] = ['A lunch', 'B lunch', 'C lunch']

function StartupGate({ children }: StartupGateProps) {
  const initialState = useMemo(() => getStoredAuthState(), [])
  const [authState, setAuthState] = useState(initialState)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(Boolean(initialState?.trustedDevice))
  const masterKey = useMemo(() => getConfiguredMasterKey(), [])

  const [name, setName] = useState<string>('')
  const [grade, setGrade] = useState<StudentProfile['grade']>('9')
  const [lunchPeriod, setLunchPeriod] = useState<StudentProfile['lunchPeriod']>('A lunch')
  const [error, setError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const activeAccount = authState?.accounts.find((account) => account.id === authState.activeAccountId)
  const isOnboarding = !authState

  const handleOnboardingSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }

    if (!isWebAuthnSupported()) {
      setError('This browser does not support WebAuthn.')
      return
    }

    setIsSubmitting(true)

    try {
      const profile: StudentProfile = {
        name: name.trim(),
        grade,
        lunchPeriod,
      }

      if (!masterKey) {
        setError('Master key credentials are missing. Set VITE_MASTER_KEY_CREDENTIAL_ID and VITE_MASTER_KEY_PUBLIC_KEY_JWK.')
        return
      }

      const assertionOptions = await createAssertionOptions(masterKey.credentialId)
      const assertion = (await navigator.credentials.get({
        publicKey: assertionOptions,
      })) as PublicKeyCredential | null

      if (!assertion) {
        setError('Master key verification was canceled.')
        return
      }

      const nextState = createInitialAuthState({
        profile,
      })

      const verification = await verifyAssertionResponse(
        masterKey,
        assertion,
        assertionOptions.challenge as Uint8Array,
      )

      if (!verification.verified) {
        setError('Master key verification failed.')
        return
      }

      saveAuthState(nextState)
      setAuthState(nextState)
      setIsUnlocked(true)
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Master key enrollment failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUnlockSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!masterKey) {
      setError('Master key credentials are missing. Set VITE_MASTER_KEY_CREDENTIAL_ID and VITE_MASTER_KEY_PUBLIC_KEY_JWK.')
      return
    }

    if (!authState) {
      setError('Device enrollment is missing. Please complete setup again.')
      setAuthState(null)
      return
    }

    if (!isWebAuthnSupported()) {
      setError('This browser does not support WebAuthn.')
      return
    }

    setIsSubmitting(true)

    try {
      const assertionOptions = await createAssertionOptions(masterKey.credentialId)
      const assertion = (await navigator.credentials.get({
        publicKey: assertionOptions,
      })) as PublicKeyCredential | null

      if (!assertion) {
        setError('Master key verification was canceled.')
        return
      }

      const verification = await verifyAssertionResponse(
        masterKey,
        assertion,
        assertionOptions.challenge as Uint8Array,
      )

      if (!verification.verified) {
        setError('Master key verification failed.')
        return
      }

      const nextState = {
        ...authState,
        trustedDevice: true,
        updatedAt: new Date().toISOString(),
      }

      saveAuthState(nextState)
      setAuthState(nextState)
      setIsUnlocked(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Master key verification failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isUnlocked) {
    return <>{children}</>
  }

  return (
    <div className="wd-gate-shell">
      <section className="wd-gate-window" aria-label="WDWebOS sign in setup">
        <header className="wd-gate-header">
          <h1>WDWebOS Startup</h1>
          <p>
            {isOnboarding
              ? 'Enroll the configured master 5C NFC security key to authorize devices and student accounts.'
              : 'Use the configured master security key to continue.'}
          </p>
        </header>

        {isOnboarding ? (
          <form className="wd-gate-form" onSubmit={handleOnboardingSubmit}>
            <label htmlFor="onboarding-name">Name</label>
            <input
              id="onboarding-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              disabled={isSubmitting}
            />

            <label htmlFor="onboarding-grade">Grade</label>
            <select
              id="onboarding-grade"
              value={grade}
              onChange={(event) => setGrade(event.target.value as StudentProfile['grade'])}
              disabled={isSubmitting}
            >
              {GRADE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  Grade {option}
                </option>
              ))}
            </select>

            <label htmlFor="onboarding-lunch">Lunch period</label>
            <select
              id="onboarding-lunch"
              value={lunchPeriod}
              onChange={(event) =>
                setLunchPeriod(event.target.value as StudentProfile['lunchPeriod'])
              }
              disabled={isSubmitting}
            >
              {LUNCH_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <p className="wd-gate-note">
              Only the configured master key can authorize WDWebOS. Set it in your local env file
              with the public credential ID and public key JWK.
            </p>

            {error && <p className="wd-gate-error">{error}</p>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Waiting for master key...' : 'Enroll master key'}
            </button>
          </form>
        ) : (
          <form className="wd-gate-form" onSubmit={handleUnlockSubmit}>
            <p className="wd-gate-profile">
              Master key enrolled for <strong>{activeAccount?.profile.name}</strong> (Grade{' '}
              {activeAccount?.profile.grade}, {activeAccount?.profile.lunchPeriod})
            </p>

            <p className="wd-gate-note">
              Unlocking requires your master key and authorizes this browser for the current
              session.
            </p>

            {error && <p className="wd-gate-error">{error}</p>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Checking master key...' : 'Unlock WDWebOS'}
            </button>
          </form>
        )}

        <footer className="wd-gate-footer">
          <small>
            Data is stored only in your browser on this device. Clearing browser data will
            remove it.
          </small>
        </footer>
      </section>
    </div>
  )
}

export default StartupGate