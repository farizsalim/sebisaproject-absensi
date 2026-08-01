'use client'

import { useEffect, useState } from 'react'
import { AuthService } from '@/services/authService'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUser = async () => {
    try {
      const data = await AuthService.getCurrentUser()
      setUser(data.user)
      setError(null)
    } catch (err) {
      setError(err.message)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    const loadUser = async () => {
      try {
        const data = await AuthService.getCurrentUser()
        if (!cancelled) {
          setUser(data.user)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          setUser(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadUser()

    return () => {
      cancelled = true
    }
  }, [])

  const login = async (email, password, rememberMe = false) => {
    setLoading(true)
    try {
      const data = await AuthService.login(email, password, rememberMe)
      setUser(data.user)
      setError(null)
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await AuthService.logout()
      setUser(null)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const register = async (data) => {
    setLoading(true)
    try {
      const response = await AuthService.register(data)
      setError(null)
      return response
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    refetch: fetchUser,
  }
}
