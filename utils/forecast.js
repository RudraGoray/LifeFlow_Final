// forecast.js — lightweight seasonal projection used by /api/analytics/predicted-demand
// This is intentionally simple (no ML dependency): it takes the historical average
// units-requested-per-ticket for each blood group and applies seasonal multipliers
// that reflect well-known demand drivers (e.g. summer heat strain, monsoon accident
// spikes, winter respiratory/surgical load, festival-season trauma cases in India).
// Swap this out for a trained model later without touching the route contract.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Relative seasonal multiplier by month (1.0 = average demand)
const SEASONAL_MULTIPLIERS = [0.95, 0.9, 1.0, 1.15, 1.25, 1.1, 1.2, 1.15, 1.05, 1.1, 1.3, 1.2]

function projectSeasonalForecast(baseDemandByGroup, monthsAhead = 6) {
  const startMonth = new Date().getMonth()
  const forecast = []
  for (let i = 0; i < monthsAhead; i++) {
    const monthIdx = (startMonth + i) % 12
    const multiplier = SEASONAL_MULTIPLIERS[monthIdx]
    const perGroup = {}
    for (const [group, base] of Object.entries(baseDemandByGroup)) {
      perGroup[group] = Math.round(base * multiplier)
    }
    forecast.push({ month: MONTHS[monthIdx], multiplier, demand: perGroup })
  }
  return forecast
}

function buildGapMatrix(forecastMonth, currentStockByGroup) {
  return Object.entries(forecastMonth.demand).map(([group, predictedUnits]) => {
    const available = currentStockByGroup[group] || 0
    const gap = predictedUnits - available
    return {
      group,
      predictedUnits,
      availableUnits: available,
      gapUnits: gap,
      status: gap > 0 ? (gap > available ? 'critical' : 'warning') : 'ok',
    }
  })
}

module.exports = { projectSeasonalForecast, buildGapMatrix, MONTHS, SEASONAL_MULTIPLIERS }
