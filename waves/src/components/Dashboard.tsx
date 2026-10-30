import { Header } from './Header'
import { StationCard } from './StationCard'
import { WaveHeightChart } from './WaveHeightChart'
import { WavePeriodChart } from './WavePeriodChart'
import { BuoyGlobe } from './BuoyGlobe'
import { useBuoyData } from '../hooks/useBuoyData'
import { STATIONS } from '../config/stations'
import { formatLocalDateTime } from '../utils/time'
import './dashboard.css'

export function Dashboard() {
  const { stations, dashboardState, isRefreshing, lastSuccessfulRefresh, refresh } = useBuoyData()

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

      <WaveHeightChart stations={stations} />
      <WavePeriodChart stations={stations} />
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
