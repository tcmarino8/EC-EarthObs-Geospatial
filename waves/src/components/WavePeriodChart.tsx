import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { StationData } from '../types/buoy'
import { filterToRecentWindow, formatLocalTime } from '../utils/time'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

interface WavePeriodChartProps {
  stations: StationData[]
  windowHours: number
}

export function WavePeriodChart({ stations, windowHours }: WavePeriodChartProps) {
  const latestTime = Math.max(
    ...stations.map((station) =>
      station.latestObservation ? new Date(station.latestObservation.timestamp).getTime() : 0,
    ),
  )

  const recentByStation = stations.map((station) =>
    filterToRecentWindow(station.observations, windowHours, latestTime || Date.now()),
  )

  const allTimestamps = Array.from(
    new Set(
      recentByStation.flatMap((observations) => observations.map((observation) => observation.timestamp)),
    ),
  ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  const colors = ['#4ad3d8', '#e6a8ff']

  return (
    <section className="panel">
      <h3>Wave Period — Last {windowHours} Hours</h3>
      <div className="chart-wrapper">
        <Line
          data={{
            labels: allTimestamps.map((timestamp) => formatLocalTime(timestamp)),
            datasets: stations.map((station, index) => {
              const byTimestamp = new Map(
                recentByStation[index].map((item) => [item.timestamp, item.dominantWavePeriod] as const),
              )
              return {
                label: station.stationLabel,
                data: allTimestamps.map((timestamp) => byTimestamp.get(timestamp) ?? null),
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length],
                borderDash: [2, 4],
                pointRadius: 2,
                pointHoverRadius: 3,
                tension: 0.2,
                spanGaps: false,
              }
            }),
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                title: { display: true, text: 'Seconds' },
                grid: { color: 'rgba(255,255,255,0.08)' },
                ticks: { maxTicksLimit: 4 },
              },
              x: {
                grid: { color: 'rgba(255,255,255,0.08)' },
                ticks: { maxTicksLimit: 4 },
              },
            },
            plugins: {
              legend: {
                labels: { color: '#f8fbff' },
              },
              tooltip: {
                callbacks: {
                  title: (tooltipItems) => {
                    const item = tooltipItems[0]
                    const timestamp = allTimestamps[item.dataIndex]
                    return new Date(timestamp).toLocaleString()
                  },
                },
              },
            },
          }}
        />
      </div>
    </section>
  )
}
