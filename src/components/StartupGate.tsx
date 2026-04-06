import { type FormEvent, type ReactNode, useMemo, useState } from 'react'
import {
  type StudentProfile,
  getStoredAuthRecord,
  saveAuthRecord,
} from '../lib/localAuth'
import {
  buildAuthenticatedRecord,
  createAssertionOptions,
  createRegistrationOptions,
  extractCredentialRecord,
  isWebAuthnSupported,
  verifyAssertionResponse,
} from '../lib/webauthn'

type StartupGateProps = {
  children: ReactNode
}

const GRADE_OPTIONS: StudentProfile['grade'][] = ['9', '10', '11', '12']
const LUNCH_OPTIONS: StudentProfile['lunchPeriod'][] = ['A lunch', 'B lunch', 'C lunch']

function StartupGate({ children }: StartupGateProps) {
  const initialRecord = useMemo(() => getStoredAuthRecord(), [])
  const [storedProfile, setStoredProfile] = useState<StudentProfile | null>(
    initialRecord?.profile ?? null,
  )
  const [storedCredentialId, setStoredCredentialId] = useState<string | null>(
    initialRecord?.credential?.credentialId ?? null,
  )
  const [isUnlocked, setIsUnlocked] = useState<boolean>(Boolean(initialRecord?.trustedDevice))

  const [name, setName] = useState<string>('')
  const [grade, setGrade] = useState<StudentProfile['grade']>('9')
  const [lunchPeriod, setLunchPeriod] = useState<StudentProfile['lunchPeriod']>('A lunch')
  const [error, setError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const isOnboarding = !storedProfile || !storedCredentialId

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

      const credentialOptions = await createRegistrationOptions(profile)
      const credential = (await navigator.credentials.create({
        publicKey: credentialOptions,
      })) as PublicKeyCredential | null

      if (!credential) {
        setError('YubiKey enrollment was canceled.')
        return
      }

      const credentialRecord = await extractCredentialRecord(credential)
      saveAuthRecord(
        buildAuthenticatedRecord({
          profile,
          credential: credentialRecord,
        }),
      )

      setStoredProfile(profile)
      setStoredCredentialId(credentialRecord.credentialId)
      setIsUnlocked(true)
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'YubiKey enrollment failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUnlockSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!storedProfile || !storedCredentialId) {
      setError('Device enrollment is missing. Please complete setup again.')
      setStoredProfile(null)
      return
    }

    if (!isWebAuthnSupported()) {
      setError('This browser does not support WebAuthn.')
      return
    }

    setIsSubmitting(true)

    try {
      const record = getStoredAuthRecord()

      if (!record) {
        setError('Enrollment data is missing. Please set up the device again.')
        return
      }

      const assertionOptions = await createAssertionOptions(record.credential.credentialId)
      const assertion = (await navigator.credentials.get({
        publicKey: assertionOptions,
      })) as PublicKeyCredential | null

      if (!assertion) {
        setError('YubiKey verification was canceled.')
        return
      }

      const verification = await verifyAssertionResponse(
        record.credential,
        assertion,
        assertionOptions.challenge as Uint8Array,
      )

      if (!verification.verified) {
        setError('YubiKey verification failed.')
        return
      }

      saveAuthRecord({
        ...record,
        credential: {
          ...record.credential,
          signCount: verification.signCount,
        },
        trustedDevice: true,
        updatedAt: new Date().toISOString(),
      })

      setIsUnlocked(true)
      setStoredCredentialId(record.credential.credentialId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'YubiKey verification failed.')
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
              ? 'Set up your profile and enroll the 5C NFC YubiKey for this device.'
              : 'Use your enrolled YubiKey to continue.'}
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

            <p className="wd-gate-note">This device stays trusted after the YubiKey is enrolled.</p>

            {error && <p className="wd-gate-error">{error}</p>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Waiting for YubiKey...' : 'Enroll YubiKey'}
            </button>
          </form>
        ) : (
          <form className="wd-gate-form" onSubmit={handleUnlockSubmit}>
            <p className="wd-gate-profile">
              Welcome back, <strong>{storedProfile?.name}</strong> (Grade {storedProfile?.grade},
              {' '}
              {storedProfile?.lunchPeriod})
            </p>

            <p className="wd-gate-note">
              YubiKey is already enrolled on this browser. Unlocking will confirm the key and
              keep this device trusted.
            </p>

            {error && <p className="wd-gate-error">{error}</p>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Checking YubiKey...' : 'Unlock WDWebOS'}
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