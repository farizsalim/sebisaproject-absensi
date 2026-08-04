const DEFAULT_CLOCK_IN_DEADLINE = '09:00'

function timeToMinutes(value) {
  const [hours, minutes] = String(value || '').split(':').map(Number)
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null
  return hours * 60 + minutes
}

function clockInMinutes(value) {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.getHours() * 60 + date.getMinutes()
}

export function getClockInDeadline() {
  return process.env.ATTENDANCE_CLOCK_IN_DEADLINE || DEFAULT_CLOCK_IN_DEADLINE
}

export function attendanceStatus({ clockInAt, clockOutAt }) {
  if (!clockInAt) return 'absent'
  if (!clockOutAt) return 'no_checkout'

  const clockIn = clockInMinutes(clockInAt)
  const deadline = timeToMinutes(getClockInDeadline())
  return clockIn !== null && deadline !== null && clockIn > deadline ? 'late' : 'present'
}
