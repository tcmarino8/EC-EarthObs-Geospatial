import { useMemo, useState } from 'react'
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
  const chartAnchorTimeMs = useMemo(() => {
    const latestObservationMs = Math.max(
      ...stations.map((station) =>
        station.latestObservation ? new Date(station.latestObservation.timestamp).getTime() : 0,
      ),
    )
    return latestObservationMs > 0 ? latestObservationMs : Date.now()
  }, [stations])

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
        <div className="window-readout">{windowHours} hrs</div>
        <p className="footer-note">
          Swipe left on either chart for a smaller window, right for a larger window.
        </p>
      </section>

      <section className="chart-grid">
        <WaveHeightChart
          stations={stations}
          windowHours={windowHours}
          anchorTimeMs={chartAnchorTimeMs}
          onWindowShift={shiftWindow}
        />
        <WavePeriodChart
          stations={stations}
          windowHours={windowHours}
          anchorTimeMs={chartAnchorTimeMs}
          onWindowShift={shiftWindow}
        />
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
