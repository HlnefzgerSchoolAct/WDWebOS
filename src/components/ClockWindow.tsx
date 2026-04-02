import { useEffect, useMemo, useState } from 'react'
import type { LunchPeriod } from '../lib/schedule'
import { getClockSnapshot } from '../lib/schedule'

type ClockWindowProps = {
  lunchPeriod?: LunchPeriod
}

function ClockWindow({ lunchPeriod = 'A lunch' }: ClockWindowProps) {
  const [now, setNow] = useState<Date>(() => new Date())

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  const snapshot = useMemo(() => getClockSnapshot(now, lunchPeriod), [now, lunchPeriod])

  return (
    <section className="wd-clock" aria-label="Clock app">
      <header className="wd-clock-header">
        <div>
          <p className="wd-clock-kicker">Today at WDWebOS</p>
          <h3>{snapshot.scheduleTitle}</h3>
        </div>
        <div className="wd-clock-day-badge" aria-label="Current day">
          {snapshot.dayLabel}
        </div>
      </header>

      <div className="wd-clock-main">
        <div className="wd-clock-time" aria-live="polite">
          {snapshot.timeLabel}
        </div>

        <div className="wd-clock-status-grid">
          <div>
            <span>Current period</span>
            <strong>{snapshot.currentPeriodLabel}</strong>
          </div>
          <div>
            <span>Next period</span>
            <strong>{snapshot.nextPeriodLabel}</strong>
          </div>
          <div>
            <span>Countdown</span>
            <strong>{snapshot.countdownLabel}</strong>
          </div>
        </div>
      </div>

      <section className="wd-clock-schedule" aria-label="Today's schedule">
        <div className="wd-clock-schedule-heading">
          <span>Schedule</span>
          <strong>{snapshot.dateLabel}</strong>
        </div>

        <ol className="wd-clock-list">
          {snapshot.blocks.length === 0 ? (
            <li className="wd-clock-empty">No classes today.</li>
          ) : (
            snapshot.blocks.map((block) => {
              const startHour = Math.floor(block.startMinutes / 60)
              const startMinute = block.startMinutes % 60
              const endHour = Math.floor(block.endMinutes / 60)
              const endMinute = block.endMinutes % 60

              const formatPart = (value: number) => String(value).padStart(2, '0')

              return (
                <li key={block.id}>
                  <span>{block.label}</span>
                  <span>
                    {formatPart(startHour)}:{formatPart(startMinute)} - {formatPart(endHour)}:
                    {formatPart(endMinute)}
                  </span>
                </li>
              )
            })
          )}
        </ol>
      </section>
    </section>
  )
}

export default ClockWindow