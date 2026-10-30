import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Header } from './Header'
import { StationCard } from './StationCard'
import { WaveHeightChart } from './WaveHeightChart'
import { WavePeriodChart } from './WavePeriodChart'
import { BuoyGlobe } from './BuoyGlobe'
import { useBuoyData } from '../hooks/useBuoyData'
import { STATIONS } from '../config/stations'
import { formatLocalDateTime } from '../utils/time'
import './dashboard.css'

const WINDOW_OPTIONS = [5, 10, 20] as const

export function Dashboard() {
  const { stations, dashboardState, isRefreshing, lastSuccessfulRefresh, refresh } = useBuoyData()
  const [windowHours, setWindowHours] = useState<(typeof WINDOW_OPTIONS)[number]>(10)
  const pointerStartX = useRef<number | null>(null)
  const windowIndex = WINDOW_OPTIONS.indexOf(windowHours)
  const canIncreaseWindow = windowIndex < WINDOW_OPTIONS.length - 1
  const canDecreaseWindow = windowIndex > 0

  const shiftWindow = (step: 1 | -1) => {
    setWindowHours((currentWindow) => {
      const currentIndex = WINDOW_OPTIONS.indexOf(currentWindow)
      const nextIndex = Math.max(
        0,
        Math.min(WINDOW_OPTIONS.length - 1, currentIndex + step),
      )
      return WINDOW_OPTIONS[nextIndex]
    })
  }

  const handleWindowPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerStartX.current = event.clientX
  }

  const handleWindowPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current === null) {
      return
    }

    const deltaX = event.clientX - pointerStartX.current
    pointerStartX.current = null

    if (deltaX <= -35) {
      shiftWindow(1)
      return
    }

    if (deltaX >= 35) {
      shiftWindow(-1)
    }
  }

  return (
    <main className="dashboard">
      <Header
        dashboardState={dashboardState}
        isRefreshing={isRefreshing}
        lastSuccessfulRefresh={lastSuccessfulRefresh}
        onRefresh={refresh}
      />

      <section className="station-grid">
        {stations.map((station) => (
          <StationCard key={station.stationId} station={station} />
        ))}
      </section>

      <section className="panel">
        <h3>Time Window</h3>
        <div
          className="window-selector"
          role="group"
          aria-label="Chart window selector"
          onPointerDown={handleWindowPointerDown}
          onPointerUp={handleWindowPointerUp}
        >
          <button
            type="button"
            className="window-arrow"
            onClick={() => shiftWindow(1)}
            disabled={!canIncreaseWindow}
            aria-label="Increase time window"
          >
            ←
          </button>
          <div className="window-readout">{windowHours} hrs</div>
          <button
            type="button"
            className="window-arrow"
            onClick={() => shiftWindow(-1)}
            disabled={!canDecreaseWindow}
            aria-label="Decrease time window"
          >
            →
          </button>
        </div>
        <p className="footer-note">Swipe left for a larger window, right for a smaller window.</p>
      </section>

      <section className="chart-grid">
        <WaveHeightChart stations={stations} windowHours={windowHours} />
        <WavePeriodChart stations={stations} windowHours={windowHours} />
      </section>
      <BuoyGlobe stations={STATIONS} />

      <footer className="panel footer-note">
        <p>NOAA NDBC observations. Data may be delayed depending on station telemetry.</p>
        <p>Last successful dashboard refresh: {formatLocalDateTime(lastSuccessfulRefresh)}</p>
        <p>
          Latest observation:{' '}
          {formatLocalDateTime(
            stations
              .map((station) => station.latestObservation?.timestamp ?? null)
              .filter((timestamp): timestamp is string => Boolean(timestamp))
              .sort()
              .at(-1) ?? null,
          )}
        </p>
      </footer>
    </main>
  )
}
