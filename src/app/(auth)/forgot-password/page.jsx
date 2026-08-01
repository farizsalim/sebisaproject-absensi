'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [step, setStep] = useState('email') // 'email' or 'sent'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setSuccess('Link reset password telah dikirim ke email Anda')
        setStep('sent')
      } else {
        setError(data.message || 'Email tidak ditemukan')
      }
    } catch (err) {
      setError('Gagal terhubung. Periksa koneksi internet Anda')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col justify-center items-center p-4 md:p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Forgot Password Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-200/50 p-5 md:p-8 space-y-5 md:space-y-6">
          
          {/* Header Section */}
          <div className="flex flex-col items-center space-y-2 md:space-y-4">
            <div className="mb-1">
              <img src="/images/logo.png" alt="Sebisa Presensi" className="h-20 md:h-32 object-contain" />
            </div>
            <div className="space-y-1 md:space-y-2 text-center">
              <h1 className="text-xl md:text-3xl font-bold text-slate-900">Reset Password</h1>
              <p className="text-slate-500 text-xs md:text-base">
                {step === 'email' 
                  ? 'Masukkan email Anda untuk reset password'
                  : 'Periksa email Anda untuk link reset password'
                }
              </p>
            </div>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex gap-3">
              <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-emerald-700 text-sm font-medium">{success}</p>
            </div>
          )}

          {/* Form or Success Message */}
          {step === 'email' ? (
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              {/* Email Input */}
              <div className="space-y-1 md:space-y-2">
                <label className="block text-xs md:text-sm font-semibold text-slate-700" htmlFor="email">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="nama@perusahaan.com"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:border-cyan-500 text-slate-900 placeholder-slate-400 transition-all duration-200"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Link reset password akan dikirim ke email ini
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 md:py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm md:text-base font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:from-cyan-500 disabled:hover:to-blue-600 flex items-center justify-center gap-2 min-h-[40px] md:min-h-[48px]"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim Link Reset</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-cyan-50/50 border border-cyan-200/50 rounded-lg p-4 text-center">
                <svg className="w-12 h-12 text-cyan-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-slate-600">
                  Kami telah mengirimkan link reset password ke <span className="font-semibold">{email}</span>
                </p>
              </div>
              <p className="text-xs text-slate-500 text-center">
                Link akan berlaku selama 1 jam. Jika tidak menerima email, cek folder spam Anda.
              </p>
              <button
                onClick={() => setStep('email')}
                className="w-full py-2 px-4 text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors"
              >
                Gunakan Email Lain
              </button>
            </div>
          )}

          {/* Divider - Hidden on Mobile */}
          <div className="hidden md:block relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500 font-medium">atau</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="bg-cyan-50/50 border border-cyan-200/50 rounded-lg p-3 md:p-4 text-center space-y-1 md:space-y-2">
            <p className="text-xs text-slate-600">
              Kembali ke halaman login
            </p>
            <Link href="/login" className="inline-block text-sm font-semibold text-cyan-600 hover:text-cyan-700 transition-colors duration-200">
              Masuk →
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs md:text-sm text-slate-300">
            Sistem Manajemen Presensi Sebisa
          </p>
        </div>
      </div>
    </div>
  )
}
