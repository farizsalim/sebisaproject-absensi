const API_BASE_URL = '/api'

export class AbsenceService {
  static async getAbsences(page = 1, role = 'employee') {
    const endpoint = role === 'hr' ? 'hr/absence-requests' : 'employee/absences'
    const response = await fetch(`${API_BASE_URL}/${endpoint}?page=${page}`, {
      credentials: 'include',
    })

    if (!response.ok) throw new Error('Failed to fetch absences')
    return await response.json()
  }

  static async getAbsence(id) {
    const response = await fetch(`${API_BASE_URL}/employee/absences/${id}`, {
      credentials: 'include',
    })

    if (!response.ok) throw new Error('Failed to fetch absence')
    return await response.json()
  }

  static async createAbsence(data) {
    const formData = new FormData()
    
    Object.keys(data).forEach(key => {
      if (key === 'proof_file' && data[key]) {
        formData.append(key, data[key])
      } else {
        formData.append(key, data[key])
      }
    })

    const response = await fetch(`${API_BASE_URL}/employee/absences`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create absence request')
    }

    return await response.json()
  }

  static async approveAbsence(id) {
    const response = await fetch(`${API_BASE_URL}/hr/absence-requests/${id}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to approve absence')
    }

    return await response.json()
  }

  static async rejectAbsence(id, reason) {
    const response = await fetch(`${API_BASE_URL}/hr/absence-requests/${id}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to reject absence')
    }

    return await response.json()
  }

  static async exportAbsences(format = 'xlsx') {
    const response = await fetch(`${API_BASE_URL}/hr/absence-requests/export/${format}`, {
      credentials: 'include',
    })

    if (!response.ok) throw new Error('Failed to export absences')
    return await response.blob()
  }
}
