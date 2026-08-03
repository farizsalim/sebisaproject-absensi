const APP_TIME_ZONE = process.env.APP_TIME_ZONE || 'Asia/Jakarta'

export function dateKeyInAppTimeZone(value = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value)
}

export function dateOnly(value) {
  return new Date(`${value}T00:00:00.000Z`)
}

export function dateOnlyRange(year, month) {
  const monthKey = String(month).padStart(2, '0')
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return {
    start: dateOnly(`${year}-${monthKey}-01`),
    end: new Date(Date.UTC(year, month - 1, lastDay, 23, 59, 59, 999)),
  }
}