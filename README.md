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
- Master security key auth flow started for device and account authorization

## Scope

This repository currently focuses on the base platform plus a small set of first-party apps.

In scope:

- Shell and desktop composition
- Window lifecycle and focus behavior
- Launcher and taskbar
- Settings core and theming
- Auth/session-ready architecture
- Master security key authority for device and student account enrollment
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

WDWebOS uses one master 5C NFC security key as the enrollment authority for all devices and
student accounts. That key is required to authorize first-time setup, add or restore accounts,
and reapprove a device session.

WebAuthn requires `localhost` or HTTPS in a modern browser. Clearing site data removes the local
session cache, but the master key remains the source of truth for enrollment.

Put the approved key credential in a local `.env.local` file at the repository root:

```bash
VITE_MASTER_KEY_CREDENTIAL_ID=your-credential-id
VITE_MASTER_KEY_PUBLIC_KEY_JWK={"kty":"EC","crv":"P-256","x":"...","y":"...","ext":true}
VITE_MASTER_KEY_RP_ID=your-domain.com
VITE_MASTER_KEY_ALGORITHM=-7
VITE_MASTER_KEY_SIGN_COUNT=0
```

Only that credential ID and public key will be accepted. If a different security key is inserted,
WDWebOS will reject it.


## Next Foundation Milestones

1. Persist settings and window layout
2. Add keyboard shortcuts and accessibility polish
3. Add auth/session API contracts
4. Add notifications center and system services layer
5. Add CI checks for lint, typecheck, and build
