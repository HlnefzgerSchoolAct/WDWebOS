import { type FormEvent, type ReactNode, useMemo, useState } from 'react'
import {
  type StudentProfile,
  getStoredAuthRecord,
  hashPassword,
  saveAuthRecord,
} from '../lib/localAuth'

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
  const [storedPasswordHash, setStoredPasswordHash] = useState<string | null>(
    initialRecord?.passwordHash ?? null,
  )
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false)

  const [name, setName] = useState<string>('')
  const [grade, setGrade] = useState<StudentProfile['grade']>('9')
  const [lunchPeriod, setLunchPeriod] = useState<StudentProfile['lunchPeriod']>('A lunch')
  const [createPassword, setCreatePassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [unlockPassword, setUnlockPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const isOnboarding = !storedProfile || !storedPasswordHash

  const handleOnboardingSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }

    if (createPassword.length < 4) {
      setError('Password must be at least 4 characters.')
      return
    }

    if (createPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      const passwordHash = await hashPassword(createPassword)
      const profile: StudentProfile = {
        name: name.trim(),
        grade,
        lunchPeriod,
      }

      saveAuthRecord({
        profile,
        passwordHash,
      })

      setStoredProfile(profile)
      setStoredPasswordHash(passwordHash)
      setCreatePassword('')
      setConfirmPassword('')
      setError('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUnlockSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!storedPasswordHash) {
      setError('Password setup is missing. Please complete onboarding again.')
      setStoredProfile(null)
      return
    }

    setIsSubmitting(true)

    try {
      const enteredHash = await hashPassword(unlockPassword)

      if (enteredHash !== storedPasswordHash) {
        setError('Incorrect password. Try again.')
        setUnlockPassword('')
        return
      }

      setIsUnlocked(true)
      setUnlockPassword('')
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
              ? 'Set up your profile and password for this device.'
              : 'Enter your password to continue.'}
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

            <label htmlFor="onboarding-password">Create password</label>
            <input
              id="onboarding-password"
              type="password"
              value={createPassword}
              onChange={(event) => setCreatePassword(event.target.value)}
              autoComplete="new-password"
              disabled={isSubmitting}
            />

            <label htmlFor="onboarding-confirm-password">Confirm password</label>
            <input
              id="onboarding-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              disabled={isSubmitting}
            />

            {error && <p className="wd-gate-error">{error}</p>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Finish setup'}
            </button>
          </form>
        ) : (
          <form className="wd-gate-form" onSubmit={handleUnlockSubmit}>
            <p className="wd-gate-profile">
              Welcome back, <strong>{storedProfile?.name}</strong> (Grade {storedProfile?.grade},
              {' '}
              {storedProfile?.lunchPeriod})
            </p>

            <label htmlFor="unlock-password">Password</label>
            <input
              id="unlock-password"
              type="password"
              value={unlockPassword}
              onChange={(event) => setUnlockPassword(event.target.value)}
              autoComplete="current-password"
              disabled={isSubmitting}
            />

            {error && <p className="wd-gate-error">{error}</p>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Checking...' : 'Unlock WDWebOS'}
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