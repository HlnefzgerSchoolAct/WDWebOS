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

type EnvVarRow = {
  key: string
  value: string
}

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
  const [setupRows, setSetupRows] = useState<EnvVarRow[]>([])
  const [setupOutput, setSetupOutput] = useState<string>('')
  const [copyStatus, setCopyStatus] = useState<string>('')

  const envTemplate = [
    'VITE_MASTER_KEY_CREDENTIAL_ID=',
    'VITE_MASTER_KEY_PUBLIC_KEY_JWK=',
    'VITE_MASTER_KEY_ALGORITHM=-7',
    'VITE_MASTER_KEY_SIGN_COUNT=0',
  ].join('\n')

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
        const registrationOptions = await createRegistrationOptions(profile)
        const credential = (await navigator.credentials.create({
          publicKey: registrationOptions,
        })) as PublicKeyCredential | null

        if (!credential) {
          setError('Master key enrollment was canceled.')
          return
        }

        const generatedMasterKey = await extractCredentialRecord(credential)
        const nextRows: EnvVarRow[] = [
          { key: 'VITE_MASTER_KEY_CREDENTIAL_ID', value: generatedMasterKey.credentialId },
          {
            key: 'VITE_MASTER_KEY_PUBLIC_KEY_JWK',
            value: JSON.stringify(generatedMasterKey.publicKeyJwk),
          },
          { key: 'VITE_MASTER_KEY_ALGORITHM', value: String(generatedMasterKey.algorithm) },
          { key: 'VITE_MASTER_KEY_SIGN_COUNT', value: String(generatedMasterKey.signCount) },
        ]

        setSetupRows(nextRows)
        setSetupOutput(nextRows.map((row) => `${row.key}=${row.value}`).join('\n'))
        setCopyStatus('')
        setError('Master key generated. Copy these values into Vercel and redeploy.')
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

  const handleCopyAll = async () => {
    if (!setupOutput) {
      return
    }

    try {
      await navigator.clipboard.writeText(setupOutput)
      setCopyStatus('Copied all values.')
    } catch {
      setError('Could not copy automatically. Copy the values manually.')
    }
  }

  const handleCopySingle = async (row: EnvVarRow) => {
    try {
      await navigator.clipboard.writeText(`${row.key}=${row.value}`)
      setCopyStatus(`Copied ${row.key}.`)
    } catch {
      setError('Could not copy automatically. Copy the values manually.')
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

  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(envTemplate)
      setCopyStatus('Copied template env values.')
    } catch {
      setError('Could not copy automatically. Copy the template manually.')
    }
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
              {masterKey
                ? 'Only the configured master key can authorize WDWebOS. Enter your account details, then enroll.'
                : 'No configured master key was found. Use this form once to generate env values, set them in Vercel, and redeploy.'}
            </p>

            {!masterKey && setupOutput && (
              <section className="wd-bootstrap-helper" aria-label="Master key setup output">
                <h2>Set These In Vercel</h2>
                <div className="wd-bootstrap-rows">
                  {setupRows.map((row) => (
                    <div key={row.key} className="wd-bootstrap-row">
                      <label>{row.key}</label>
                      <textarea
                        value={row.value}
                        readOnly
                        rows={row.key === 'VITE_MASTER_KEY_PUBLIC_KEY_JWK' ? 4 : 1}
                      />
                      <button type="button" onClick={() => handleCopySingle(row)}>
                        Copy {row.key}
                      </button>
                    </div>
                  ))}
                </div>
                <pre>{setupOutput}</pre>
                <button type="button" onClick={handleCopyAll}>Copy All Values</button>
                {copyStatus && <p className="wd-bootstrap-status">{copyStatus}</p>}
              </section>
            )}

            {!masterKey && (
              <section className="wd-bootstrap-helper" aria-label="Master key bootstrap helper">
                <h3>Credential Bootstrap Helper</h3>
                <p>
                  Paste these into your environment variables (Vercel or local), then redeploy and
                  refresh this page.
                </p>
                <pre>{envTemplate}</pre>
                <button type="button" onClick={handleCopyTemplate}>Copy Env Template</button>
                {copyStatus && <p className="wd-bootstrap-status">{copyStatus}</p>}
              </section>
            )}

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