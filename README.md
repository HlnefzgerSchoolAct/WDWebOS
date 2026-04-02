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

## Scope

This repository currently focuses on the base platform plus a small set of first-party apps.

In scope:

- Shell and desktop composition
- Window lifecycle and focus behavior
- Launcher and taskbar
- Settings core and theming
- Auth/session-ready architecture
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

## Next Foundation Milestones

1. Persist settings and window layout
2. Add keyboard shortcuts and accessibility polish
3. Add auth/session API contracts
4. Add notifications center and system services layer
5. Add CI checks for lint, typecheck, and build
