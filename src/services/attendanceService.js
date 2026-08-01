const API_BASE_URL = '/api'

export class AttendanceService {
  static async getAttendances(page = 1, filters = {}) {
    const params = new URLSearchParams({
      page,
      ...filters,
    })

    const response = await fetch(`${API_BASE_URL}/hr/attendances?${params}`, {
      credentials: 'include',
    })

    if (!response.ok) throw new Error('Failed to fetch attendances')
    return await response.json()
  }

  static async clockIn(data) {
    const response = await fetch(`${API_BASE_URL}/employee/clock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to clock in')
    }

    return await response.json()
  }

  static async getAttendanceHistory(page = 1) {
    const response = await fetch(`${API_BASE_URL}/employee/attendance-history?page=${page}`, {
      credentials: 'include',
    })

    if (!response.ok) throw new Error('Failed to fetch attendance history')
    return await response.json()
  }

  static async recordManualAttendance(data) {
    const response = await fetch(`${API_BASE_URL}/hr/attendances/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to record attendance')
    }

    return await response.json()
  }

  static async exportAttendances(format = 'xlsx') {
    const response = await fetch(`${API_BASE_URL}/hr/attendances/export/${format}`, {
      credentials: 'include',
    })

    if (!response.ok) throw new Error('Failed to export attendances')
    return await response.blob()
  }
}
