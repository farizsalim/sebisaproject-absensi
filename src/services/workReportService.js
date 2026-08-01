const API_BASE_URL = '/api'

export class WorkReportService {
  static async getWorkReports(page = 1, role = 'employee') {
    const endpoint = role === 'hr' ? 'hr/work-reports' : 'employee/work-reports'
    const response = await fetch(`${API_BASE_URL}/${endpoint}?page=${page}`, {
      credentials: 'include',
    })

    if (!response.ok) throw new Error('Failed to fetch work reports')
    return await response.json()
  }

  static async getWorkReport(id) {
    const response = await fetch(`${API_BASE_URL}/employee/work-reports/${id}`, {
      credentials: 'include',
    })

    if (!response.ok) throw new Error('Failed to fetch work report')
    return await response.json()
  }

  static async createWorkReport(data) {
    const response = await fetch(`${API_BASE_URL}/employee/work-reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create work report')
    }

    return await response.json()
  }

  static async updateAssessment(id, assessment) {
    const response = await fetch(`${API_BASE_URL}/hr/work-reports/${id}/assessment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assessment),
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update assessment')
    }

    return await response.json()
  }

  static async exportWorkReports(format = 'xlsx') {
    const response = await fetch(`${API_BASE_URL}/hr/work-reports/export/${format}`, {
      credentials: 'include',
    })

    if (!response.ok) throw new Error('Failed to export work reports')
    return await response.blob()
  }
}
