import { useEffect, useMemo, useState, type MouseEvent as ReactMouseEvent } from 'react'
import ClockWindow from './components/ClockWindow'
import BackcountryWindow from './components/BackcountryWindow'
import BasketballLegendsWindow from './components/BasketballLegendsWindow'
import BasketballStarsWindow from './components/BasketballStarsWindow'
import BasketRandomWindow from './components/BasketRandomWindow'
import BoxingRandomWindow from './components/BoxingRandomWindow'
import Deathrun3DWindow from './components/Deathrun3DWindow'
import GeometryDashWindow from './components/GeometryDashWindow'
import MinecraftWindow from './components/MinecraftWindow.tsx'
import DuckLife1Window from './components/DuckLife1Window'
import DuckLife2Window from './components/DuckLife2Window'
import DuckLife3Window from './components/DuckLife3Window'
import DuckLife4Window from './components/DuckLife4Window'
import DuckLife5Window from './components/DuckLife5Window'
import BTD4Window from './components/BTD4Window'
import RetroBowlWindow from './components/RetroBowlWindow'

type WindowState = {
  id: string
  title: string
  type?: 'app' | 'folder'
  contents?: string[]
  x: number
  y: number
  width: number
  height: number
  isFullscreen: boolean
  minimized: boolean
  isOpen: boolean
}

type DragState = {
  windowId: string
  pointerOffsetX: number
  pointerOffsetY: number
}

const INITIAL_WINDOWS: WindowState[] = [
  {
    id: 'welcome',
    title: 'Welcome Panel',
    x: 88,
    y: 92,
    width: 520,
    height: 330,
    isFullscreen: false,
    minimized: false,
    isOpen: true,
  },
  {
    id: 'roadmap',
    title: 'Foundation Roadmap',
    x: 220,
    y: 160,
    width: 560,
    height: 340,
    isFullscreen: false,
    minimized: false,
    isOpen: true,
  },
  {
    id: 'clock',
    title: 'Clock',
    type: 'app',
    x: 320,
    y: 120,
    width: 420,
    height: 560,
    isFullscreen: false,
    minimized: false,
    isOpen: false,
  },
  {
    id: 'minecraft',
    title: 'Minecraft',
    type: 'app',
    x: 152,
    y: 188,
    width: 920,
    height: 620,
    isFullscreen: false,
    minimized: false,
    isOpen: false,
  },
  {
    id: 'ducklife1',
    title: 'Duck Life 1',
    type: 'app',
    x: 160,
    y: 194,
    width: 920,
    height: 620,
    isFullscreen: false,
    minimized: false,
    isOpen: false,
  },
  {
    id: 'ducklife2',
    title: 'Duck Life 2',
    type: 'app',
    x: 168,
    y: 200,
    width: 920,
    height: 620,
    isFullscreen: false,
    minimized: false,
    isOpen: false,
  },
  {
    id: 'ducklife3',
    title: 'Duck Life 3',
    type: 'app',
    x: 176,
    y: 206,
    width: 920,
    height: 620,
    isFullscreen: false,
    minimized: false,
    isOpen: false,
  },
  {
    id: 'ducklife4',
    title: 'Duck Life 4',
    type: 'app',
    x: 184,
    y: 212,
    width: 920,
    height: 620,
    isFullscreen: false,
    minimized: false,
    isOpen: false,
  },
  {
    id: 'ducklife5',
    title: 'Duck Life 5',
    type: 'app',
    x: 192,
    y: 218,
    width: 920,
    height: 620,
    isFullscreen: false,
    minimized: false,
    isOpen: false,
  },
  {
    id: 'btd4',
    title: 'Bloons TD 4',
    type: 'app',
    x: 200,
    y: 224,
    width: 920,
    height: 620,
    isFullscreen: false,
    minimized: false,
    isOpen: false,
  },
  {
    id: 'backcountry',
    title: 'Backcountry',
    type: 'app',
    x: 208,
    y: 230,
    width: 920,
    height: 620,
    isFullscreen: false,
    minimized: false,
    isOpen: false,
  },
  {
    id: 'basketballlegends',
    title: 'Basketball Legends',
    type: 'app',
    x: 216,
    y: 236,
    width: 920,
    height: 620,
    isFullscreen: false,
    minimized: false,
    isOpen: false,
  },
  {
    id: 'basketballstars',
    title: 'Basketball Stars',
    type: 'app',
    x: 224,
    y: 242,
    width: 920,
    height: 620,
    isFullscreen: false,
    minimized: false,
    isOpen: false,
  },
  {
    id: 'basketrandom',
    title: 'Basket Random',
    type: 'app',
    x: 232,
    y: 248,
    width: 920,
    height: 620,
    isFullscreen: false,
    minimized: false,
    isOpen: false,
  },
  {
    id: 'boxingrandom',
    title: 'Boxing Random',
    type: 'app',
    x: 240,
    y: 254,
    width: 920,
    height: 620,
    isFullscreen: false,
    minimized: false,
    isOpen: false,
  },
  {
    id: 'deathrun3d',
    title: 'Death Run 3D',
    type: 'app',
    x: 248,
    y: 260,
    width: 920,
    height: 620,
    isFullscreen: false,
    minimized: false,
    isOpen: false,
  },
  {
    id: 'geometrydash',
    title: 'Geometry Dash',
    type: 'app',
    x: 256,
    y: 266,
    width: 920,
    height: 620,
    isFullscreen: false,
    minimized: false,
    isOpen: false,
  },
  {
    id: 'retrobowl',
    title: 'Retro Bowl',
    type: 'app',
    x: 264,
    y: 272,
    width: 920,
    height: 620,
    isFullscreen: false,
    minimized: false,
    isOpen: false,
  },
  {
    id: 'folder-games',
    title: 'Games',
    type: 'folder',
    contents: [
      'backcountry',
      'basketballlegends',
      'basketballstars',
      'basketrandom',
      'btd4',
      'boxingrandom',
      'deathrun3d',
      'ducklife1',
      'ducklife2',
      'ducklife3',
      'ducklife4',
      'ducklife5',
      'geometrydash',
      'minecraft',
      'retrobowl',
    ],
    x: 88,
    y: 246,
    width: 430,
    height: 350,
    isFullscreen: false,
    minimized: false,
    isOpen: false,
  },
  {
    id: 'folder-apps',
    title: 'Apps',
    type: 'folder',
    contents: ['clock'],
    x: 200,
    y: 210,
    width: 430,
    height: 350,
    isFullscreen: false,
    minimized: false,
    isOpen: false,
  },
]

const GAME_WINDOW_IDS = new Set([
  'minecraft',
  'ducklife1',
  'ducklife2',
  'ducklife3',
  'ducklife4',
  'ducklife5',
  'btd4',
  'backcountry',
  'basketballlegends',
  'basketballstars',
  'basketrandom',
  'boxingrandom',
  'deathrun3d',
  'geometrydash',
  'retrobowl',
])

function App() {
  const [windows, setWindows] = useState<WindowState[]>(INITIAL_WINDOWS)
  const [activeWindowId, setActiveWindowId] = useState<string>('roadmap')
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [isLauncherOpen, setIsLauncherOpen] = useState<boolean>(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)
  const [theme, setTheme] = useState<'heritage' | 'night'>('heritage')

  const runningWindows = useMemo(
    () => windows.filter((windowItem) => windowItem.isOpen),
    [windows],
  )

  const toggleWindowMinimize = (id: string) => {
    setWindows((current) =>
      current.map((windowItem) =>
        windowItem.id === id
          ? {
              ...windowItem,
              isFullscreen: windowItem.minimized ? windowItem.isFullscreen : false,
              minimized: !windowItem.minimized,
            }
          : windowItem,
      ),
    )
  }

  const toggleWindowFullscreen = (id: string) => {
    setWindows((current) =>
      current.map((windowItem) =>
        windowItem.id === id
          ? {
              ...windowItem,
              minimized: false,
              isFullscreen: !windowItem.isFullscreen,
            }
          : windowItem,
      ),
    )
    setActiveWindowId(id)
  }

  const closeWindow = (id: string) => {
    setWindows((current) =>
      current.map((windowItem) =>
        windowItem.id === id
          ? {
              ...windowItem,
              isOpen: false,
            }
          : windowItem,
      ),
    )
  }

  const launchWindow = (id: string) => {
    setWindows((current) =>
      current.map((windowItem) =>
        windowItem.id === id
          ? {
              ...windowItem,
              isOpen: true,
              minimized: false,
            }
          : windowItem,
      ),
    )
    setActiveWindowId(id)
    setIsLauncherOpen(false)
  }

  const startWindowDrag = (
    event: ReactMouseEvent<HTMLDivElement>,
    windowItem: WindowState,
  ) => {
    if (event.button !== 0) {
      return
    }

    setActiveWindowId(windowItem.id)
    setDragState({
      windowId: windowItem.id,
      pointerOffsetX: event.clientX - windowItem.x,
      pointerOffsetY: event.clientY - windowItem.y,
    })
  }

  useEffect(() => {
    if (!dragState) {
      return
    }

    const handleMouseMove = (event: MouseEvent) => {
      setWindows((current) =>
        current.map((windowItem) => {
          if (windowItem.id !== dragState.windowId) {
            return windowItem
          }

          const minX = 0
          const minY = 32
          const maxX = Math.max(minX, window.innerWidth - 96)
          const maxY = Math.max(minY, window.innerHeight - 120)

          const nextX = Math.min(
            Math.max(event.clientX - dragState.pointerOffsetX, minX),
            maxX,
          )
          const nextY = Math.min(
            Math.max(event.clientY - dragState.pointerOffsetY, minY),
            maxY,
          )

          return {
            ...windowItem,
            x: nextX,
            y: nextY,
          }
        }),
      )
    }

    const handleMouseUp = () => {
      setDragState(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState])

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      setWindows((current) =>
        current.map((windowItem) =>
          windowItem.id === activeWindowId && windowItem.isFullscreen
            ? {
                ...windowItem,
                isFullscreen: false,
              }
            : windowItem,
        ),
      )
    }

    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [activeWindowId])

  return (
    <div className={`wd-shell ${theme}`}>
      <header className="wd-banner" role="status">
        WDWebOS is not affiliated with, endorsed by, or connected to West Delaware
        Schools or its administration. It is a student-created project,
        independently maintained.
      </header>

      <main className="wd-desktop" aria-label="WDWebOS desktop workspace">
        <section className="wd-icons" aria-label="Desktop shortcuts">
          <button className="wd-icon" onClick={() => launchWindow('welcome')}>
            <span className="wd-icon-mark" aria-hidden="true">
              WD
            </span>
            <span className="wd-icon-kicker">System</span>
            <strong>Welcome</strong>
          </button>
          <button className="wd-icon" onClick={() => launchWindow('roadmap')}>
            <span className="wd-icon-mark" aria-hidden="true">
              RM
            </span>
            <span className="wd-icon-kicker">System</span>
            <strong>Roadmap</strong>
          </button>
          <button className="wd-icon" onClick={() => launchWindow('folder-games')}>
            <span className="wd-icon-mark" aria-hidden="true">
              GM
            </span>
            <span className="wd-icon-kicker">Folder</span>
            <strong>Games</strong>
          </button>
          <button className="wd-icon" onClick={() => launchWindow('minecraft')}>
            <span className="wd-icon-mark" aria-hidden="true">
              MC
            </span>
            <span className="wd-icon-kicker">Game</span>
            <strong>Minecraft</strong>
          </button>
          <button className="wd-icon" onClick={() => launchWindow('folder-apps')}>
            <span className="wd-icon-mark" aria-hidden="true">
              AP
            </span>
            <span className="wd-icon-kicker">Folder</span>
            <strong>Apps</strong>
          </button>
        </section>

        {windows.map((windowItem, index) => {
          if (!windowItem.isOpen || windowItem.minimized) {
            return null
          }

          const isActive = activeWindowId === windowItem.id
          const windowClassNames = [
            'wd-window',
            isActive ? 'active' : '',
            windowItem.isFullscreen ? 'fullscreen' : '',
          ]
            .filter(Boolean)
            .join(' ')

          const windowStyle = windowItem.isFullscreen
            ? {
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                zIndex: isActive ? 260 : 200,
              }
            : {
                left: `${windowItem.x}px`,
                top: `${windowItem.y}px`,
                width: `${windowItem.width}px`,
                height: `${windowItem.height}px`,
                zIndex: isActive ? 200 : 100 + index,
              }

          return (
            <article
              key={windowItem.id}
              className={windowClassNames}
              style={windowStyle}
              onMouseDown={() => setActiveWindowId(windowItem.id)}
              aria-label={windowItem.title}
            >
              <div
                className={`wd-window-bar ${dragState?.windowId === windowItem.id ? 'dragging' : ''}`}
                onMouseDown={(event) => {
                  if (windowItem.isFullscreen) {
                    return
                  }

                  startWindowDrag(event, windowItem)
                }}
              >
                <h2>{windowItem.title}</h2>
                <div className="wd-window-actions">
                  <button
                    className="wd-window-action"
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation()
                      toggleWindowFullscreen(windowItem.id)
                    }}
                    aria-label={
                      windowItem.isFullscreen
                        ? `Exit fullscreen ${windowItem.title}`
                        : `Fullscreen ${windowItem.title}`
                    }
                  >
                    <span className="wd-window-action-icon" aria-hidden="true">
                      <svg viewBox="0 0 16 16" focusable="false">
                        {windowItem.isFullscreen ? (
                          <>
                            <path d="M3 5.25A2.25 2.25 0 0 1 5.25 3h4.5A2.25 2.25 0 0 1 12 5.25v4.5A2.25 2.25 0 0 1 9.75 12h-4.5A2.25 2.25 0 0 1 3 9.75z" />
                            <path d="M5.5 5.5h4v4h-4z" />
                          </>
                        ) : (
                          <>
                            <path d="M2.75 3h6.5A1.75 1.75 0 0 1 11 4.75v6.5A1.75 1.75 0 0 1 9.25 13h-6.5A1.75 1.75 0 0 1 1 11.25v-6.5A1.75 1.75 0 0 1 2.75 3z" />
                            <path d="M3.5 5.5h5v5h-5z" />
                            <path d="M10.5 2.5h2.75v2.75h-1.25v-1.5h-1.5z" />
                          </>
                        )}
                      </svg>
                    </span>
                  </button>
                  <button
                    className="wd-window-action"
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation()
                      toggleWindowMinimize(windowItem.id)
                    }}
                    aria-label={`Minimize ${windowItem.title}`}
                  >
                    <span className="wd-window-action-icon" aria-hidden="true">
                      <svg viewBox="0 0 16 16" focusable="false">
                        <path d="M3 8.75h10v1.5H3z" />
                      </svg>
                    </span>
                  </button>
                  <button
                    className="wd-window-action close"
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation()
                      closeWindow(windowItem.id)
                    }}
                    aria-label={`Close ${windowItem.title}`}
                  >
                    <span className="wd-window-action-icon" aria-hidden="true">
                      <svg viewBox="0 0 16 16" focusable="false">
                        <path d="M4.22 3.16 8 6.94l3.78-3.78 1.06 1.06L9.06 8l3.78 3.78-1.06 1.06L8 9.06l-3.78 3.78-1.06-1.06L6.94 8 3.16 4.22z" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>

              <div
                className={`wd-window-content ${GAME_WINDOW_IDS.has(windowItem.id) ? 'game' : ''}`}
              >
                {windowItem.id === 'welcome' && (
                  <>
                    <p>
                      Base implementation is live: desktop shell, launcher,
                      taskbar, settings panel, and window lifecycle state.
                    </p>
                    <ul>
                      <li>Desktop-first layout for Chromebook and laptop use</li>
                      <li>Student account-ready shell structure</li>
                      <li>Public-hosting friendly legal and privacy baseline</li>
                    </ul>
                  </>
                )}

                {windowItem.id === 'roadmap' && (
                  <>
                    <p>Current implementation track for base OS foundation:</p>
                    <ol>
                      <li>Shell + desktop composition</li>
                      <li>Window manager interactions</li>
                      <li>Launcher and taskbar integration</li>
                      <li>Settings and theme persistence</li>
                      <li>Auth/session backend contracts</li>
                    </ol>
                  </>
                )}

                {windowItem.type === 'folder' && (
                  <section className="wd-folder-view" aria-label={`${windowItem.title} folder contents`}>
                    <p>
                      {windowItem.contents?.length
                        ? `${windowItem.contents.length} item${windowItem.contents.length === 1 ? '' : 's'}`
                        : 'This folder is empty.'}
                    </p>
                    {windowItem.contents && windowItem.contents.length > 0 && (
                      <div className="wd-folder-grid">
                        {windowItem.contents
                          .map((entryId) => windows.find((windowEntry) => windowEntry.id === entryId))
                          .filter((windowEntry): windowEntry is WindowState => Boolean(windowEntry))
                          .map((windowEntry) => (
                            <button
                              key={`${windowItem.id}-${windowEntry.id}`}
                              className="wd-folder-item"
                              onClick={() => launchWindow(windowEntry.id)}
                              aria-label={`Open ${windowEntry.title}`}
                            >
                              <span className="wd-folder-item-mark" aria-hidden="true">
                                {windowEntry.title.slice(0, 2).toUpperCase()}
                              </span>
                              <strong>{windowEntry.title}</strong>
                            </button>
                          ))}
                      </div>
                    )}
                  </section>
                )}

                {windowItem.id === 'clock' && <ClockWindow />}

                {windowItem.id === 'minecraft' && <MinecraftWindow />}
                {windowItem.id === 'ducklife1' && <DuckLife1Window />}
                {windowItem.id === 'ducklife2' && <DuckLife2Window />}
                {windowItem.id === 'ducklife3' && <DuckLife3Window />}
                {windowItem.id === 'ducklife4' && <DuckLife4Window />}
                {windowItem.id === 'ducklife5' && <DuckLife5Window />}
                {windowItem.id === 'btd4' && <BTD4Window />}
                {windowItem.id === 'backcountry' && <BackcountryWindow />}
                {windowItem.id === 'basketballlegends' && <BasketballLegendsWindow />}
                {windowItem.id === 'basketballstars' && <BasketballStarsWindow />}
                {windowItem.id === 'basketrandom' && <BasketRandomWindow />}
                {windowItem.id === 'boxingrandom' && <BoxingRandomWindow />}
                {windowItem.id === 'deathrun3d' && <Deathrun3DWindow />}
                {windowItem.id === 'geometrydash' && <GeometryDashWindow />}
                {windowItem.id === 'retrobowl' && <RetroBowlWindow />}
              </div>
            </article>
          )
        })}

        {isLauncherOpen && (
          <section className="wd-launcher" aria-label="System launcher">
            <h3>Launcher</h3>
            <button onClick={() => launchWindow('welcome')}>Open Welcome</button>
            <button onClick={() => launchWindow('roadmap')}>Open Roadmap</button>
            <button onClick={() => launchWindow('clock')}>Open Clock</button>
            <button onClick={() => launchWindow('backcountry')}>Open Backcountry</button>
            <button onClick={() => launchWindow('basketballlegends')}>Open Basketball Legends</button>
            <button onClick={() => launchWindow('basketballstars')}>Open Basketball Stars</button>
            <button onClick={() => launchWindow('basketrandom')}>Open Basket Random</button>
            <button onClick={() => launchWindow('btd4')}>Open Bloons TD 4</button>
            <button onClick={() => launchWindow('boxingrandom')}>Open Boxing Random</button>
            <button onClick={() => launchWindow('deathrun3d')}>Open Death Run 3D</button>
            <button onClick={() => launchWindow('ducklife1')}>Open Duck Life 1</button>
            <button onClick={() => launchWindow('ducklife2')}>Open Duck Life 2</button>
            <button onClick={() => launchWindow('ducklife3')}>Open Duck Life 3</button>
            <button onClick={() => launchWindow('ducklife4')}>Open Duck Life 4</button>
            <button onClick={() => launchWindow('ducklife5')}>Open Duck Life 5</button>
            <button onClick={() => launchWindow('geometrydash')}>Open Geometry Dash</button>
            <button onClick={() => launchWindow('minecraft')}>Open Minecraft</button>
            <button onClick={() => launchWindow('retrobowl')}>Open Retro Bowl</button>
            <button onClick={() => setIsSettingsOpen(true)}>Open Settings</button>
          </section>
        )}

        {isSettingsOpen && (
          <section className="wd-settings" aria-label="System settings">
            <h3>System Settings</h3>
            <div className="wd-setting-row">
              <span>Theme</span>
              <div className="wd-theme-toggle">
                <button
                  className={theme === 'heritage' ? 'is-active' : ''}
                  onClick={() => setTheme('heritage')}
                >
                  Heritage
                </button>
                <button
                  className={theme === 'night' ? 'is-active' : ''}
                  onClick={() => setTheme('night')}
                >
                  Night
                </button>
              </div>
            </div>
            <div className="wd-setting-row">
              <span>Accessibility</span>
              <p>Keyboard-first navigation baseline enabled.</p>
            </div>
            <button onClick={() => setIsSettingsOpen(false)}>Close Settings</button>
          </section>
        )}
      </main>

      <footer className="wd-taskbar" aria-label="WDWebOS taskbar">
        <button
          className="wd-start"
          onClick={() => setIsLauncherOpen((current) => !current)}
        >
          WD Start
        </button>

        <div className="wd-running" aria-label="Running windows">
          {runningWindows.length === 0 && <span>No open windows</span>}
          {runningWindows.map((windowItem) => (
            <button
              key={windowItem.id}
              onClick={() => {
                if (windowItem.minimized) {
                  launchWindow(windowItem.id)
                } else {
                  setActiveWindowId(windowItem.id)
                }
              }}
            >
              {windowItem.title}
            </button>
          ))}
        </div>

        <button className="wd-settings-toggle" onClick={() => setIsSettingsOpen(true)}>
          Settings
        </button>
      </footer>
    </div>
  )
}

export default App
