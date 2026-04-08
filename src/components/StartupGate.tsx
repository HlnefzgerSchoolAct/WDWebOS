import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react'
import { clearAuthState } from '../lib/localAuth'
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

type EnvVarRow = {
  key: string
  value: string
}

function formatWebAuthnError(cause: unknown, rpId: string): string {
  if (cause instanceof DOMException && cause.name === 'NotAllowedError') {
    return 'Security key check timed out or was canceled.'
  }

  if (cause instanceof Error) {
    const message = cause.message.toLowerCase()

    if (
      message.includes('not registered') ||
      message.includes('credential') ||
      message.includes('rp id mismatch')
    ) {
      return `This key is not registered for RP ID \"${rpId}\". Set VITE_MASTER_KEY_RP_ID to a hostname only (for example wd-web-os.vercel.app, not https://wd-web-os.vercel.app/) or re-enroll on the current domain.`
    }

    return cause.message
  }

  return 'Master key verification failed.'
}

function StartupGate({ children }: StartupGateProps) {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false)
  const masterKey = useMemo(() => getConfiguredMasterKey(), [])
  const effectiveRpId = masterKey?.rpId ?? window.location.hostname
  const [error, setError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [setupRows, setSetupRows] = useState<EnvVarRow[]>([])
  const [setupOutput, setSetupOutput] = useState<string>('')
  const [copyStatus, setCopyStatus] = useState<string>('')

  useEffect(() => {
    clearAuthState()
  }, [])

  const envTemplate = [
    'VITE_MASTER_KEY_CREDENTIAL_ID=',
    'VITE_MASTER_KEY_PUBLIC_KEY_JWK=',
    `VITE_MASTER_KEY_RP_ID=${window.location.hostname}`,
    'VITE_MASTER_KEY_ALGORITHM=-7',
    'VITE_MASTER_KEY_SIGN_COUNT=0',
  ].join('\n')

  const handleCreateMasterKey = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!isWebAuthnSupported()) {
      setError('This browser does not support WebAuthn.')
      return
    }

    setIsSubmitting(true)

    try {
      if (!masterKey) {
        const registrationOptions = await createRegistrationOptions(window.location.hostname)
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
          { key: 'VITE_MASTER_KEY_RP_ID', value: window.location.hostname },
          { key: 'VITE_MASTER_KEY_ALGORITHM', value: String(generatedMasterKey.algorithm) },
          { key: 'VITE_MASTER_KEY_SIGN_COUNT', value: String(generatedMasterKey.signCount) },
        ]

        setSetupRows(nextRows)
        setSetupOutput(nextRows.map((row) => `${row.key}=${row.value}`).join('\n'))
        setCopyStatus('')
        setError('Master key generated. Copy these values into Vercel and redeploy.')
        return
      }

      const assertionOptions = await createAssertionOptions(masterKey.credentialId, masterKey.rpId)
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
        masterKey.rpId,
      )

      if (!verification.verified) {
        setError('Master key verification failed.')
        return
      }

      setIsUnlocked(true)
      setError('')
    } catch (cause) {
      setError(formatWebAuthnError(cause, effectiveRpId))
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

    if (!isWebAuthnSupported()) {
      setError('This browser does not support WebAuthn.')
      return
    }

    setIsSubmitting(true)

    try {
      const assertionOptions = await createAssertionOptions(masterKey.credentialId, masterKey.rpId)
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
        masterKey.rpId,
      )

      if (!verification.verified) {
        setError('Master key verification failed.')
        return
      }
      setIsUnlocked(true)
    } catch (cause) {
      setError(formatWebAuthnError(cause, effectiveRpId))
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
            {masterKey
              ? 'Use the configured master 5C NFC security key to unlock WDWebOS.'
              : 'Generate the master key values once, save them, redeploy, and then unlock with the key.'}
          </p>
        </header>
        <form className="wd-gate-form" onSubmit={masterKey ? handleUnlockSubmit : handleCreateMasterKey}>
          {!masterKey ? (
            <>
              <p className="wd-gate-note">
                No configured master key was found. Use the YubiKey once to generate the env
                values, save them, then redeploy.
              </p>

              {setupOutput && (
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

              {error && <p className="wd-gate-error">{error}</p>}

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Generating master key...' : 'Generate master key'}
              </button>
            </>
          ) : (
            <>
              <p className="wd-gate-note">
                Unlocking requires the configured master key and nothing else.
              </p>

              {error && <p className="wd-gate-error">{error}</p>}

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Checking master key...' : 'Unlock WDWebOS'}
              </button>
            </>
          )}
        </form>

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