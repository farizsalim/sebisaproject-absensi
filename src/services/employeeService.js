const API_BASE_URL = '/api'

export class EmployeeService {
  static async getEmployees(page = 1, search = '', role = '') {
    const params = new URLSearchParams({
      page,
      ...(search && { search }),
      ...(role && { role }),
    })

    const response = await fetch(`${API_BASE_URL}/hr/employees?${params}`, {
      credentials: 'include',
    })

    if (!response.ok) throw new Error('Failed to fetch employees')
    return await response.json()
  }

  static async getEmployee(id) {
    const response = await fetch(`${API_BASE_URL}/hr/employees/${id}`, {
      credentials: 'include',
    })

    if (!response.ok) throw new Error('Failed to fetch employee')
    return await response.json()
  }

  static async createEmployee(data) {
    const response = await fetch(`${API_BASE_URL}/hr/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create employee')
    }

    return await response.json()
  }

  static async updateEmployee(id, data) {
    const response = await fetch(`${API_BASE_URL}/hr/employees/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update employee')
    }

    return await response.json()
  }

  static async deleteEmployee(id) {
    const response = await fetch(`${API_BASE_URL}/hr/employees/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!response.ok) throw new Error('Failed to delete employee')
    return await response.json()
  }

  static async restoreEmployee(id) {
    const response = await fetch(`${API_BASE_URL}/hr/employees/${id}/restore`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!response.ok) throw new Error('Failed to restore employee')
    return await response.json()
  }
}
