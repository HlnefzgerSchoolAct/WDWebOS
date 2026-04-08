# WDWebOS

Web OS foundation planned and built by West Delaware students for West Delaware students.

WDWebOS is not affiliated with, endorsed by, or connected to West Delaware Schools or its administration. It is a student-created project, independently maintained.

## Current Status

Base implementation has started with the foundation shell and system layout:

- Desktop shell with window surface
- Basic window manager state (open, close, minimize, focus)
- Taskbar with running window controls
- Launcher panel for core system windows
- Settings panel with theme switching
- Responsive desktop-first layout
- Clock app with school schedule, live time, and countdown display
- Master security key auth flow started for device unlock

## Scope

This repository currently focuses on the base platform plus a small set of first-party apps.

In scope:

- Shell and desktop composition
- Window lifecycle and focus behavior
- Launcher and taskbar
- Settings core and theming
- Auth/session-ready architecture
- Master security key authority for device unlock
- Accessibility and legal baseline
- Clock and schedule-driven school day logic

Out of scope for now:

- Marketplace or plugin ecosystem
- School-system integrations

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Authentication Model

WDWebOS uses one master 5C NFC security key as the only startup authenticator. If the key is
not configured, the app stays on the setup screen until the master credential values are
generated and saved.

WebAuthn requires `localhost` or HTTPS in a modern browser. Clearing site data removes any
leftover local auth state, but the master key remains the only source of access.

Generate the approved key credential in the startup gate, then save the output in a local
`.env.local` file or in Vercel environment variables:

```bash
VITE_MASTER_KEY_CREDENTIAL_ID=your-credential-id
VITE_MASTER_KEY_PUBLIC_KEY_JWK={"kty":"EC","crv":"P-256","x":"...","y":"...","ext":true}
VITE_MASTER_KEY_RP_ID=your-domain.com
VITE_MASTER_KEY_ALGORITHM=-7
VITE_MASTER_KEY_SIGN_COUNT=0
```

Only that credential ID and public key will be accepted. If a different security key is inserted,
WDWebOS will reject it.

The app clears old browser auth state on startup so any previous local login data cannot unlock
the desktop.


## Next Foundation Milestones

1. Persist settings and window layout
2. Add keyboard shortcuts and accessibility polish
3. Add auth/session API contracts
4. Add notifications center and system services layer
5. Add CI checks for lint, typecheck, and build
