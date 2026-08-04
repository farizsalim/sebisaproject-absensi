'use client'

import { useEffect, useState } from 'react'
import EmployeeShell from '@/components/employee/EmployeeShell'
import { formatTime } from '@/lib/utils'

export default function ClockPage() {
  const [attendance, setAttendance] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    fetch('/api/employee/clock').then((response) => response.json().then((data) => {
      if (response.ok) setAttendance(data.attendance)
    }))
  }, [])
  const clock = async (action) => { setLoading(true); setMessage(''); const response = await fetch('/api/employee/clock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) }); const data = await response.json(); setMessage(data.message || 'Terjadi kesalahan.'); if (response.ok) setAttendance(data.attendance); setLoading(false) }
  return <EmployeeShell><header className="mb-8"><h1 className="text-2xl font-semibold">Presensi Hari Ini</h1><p className="mt-1 text-sm text-slate-500">Catat waktu masuk dan pulang Anda.</p></header><section className="max-w-xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm"><div className="mb-8 text-center"><span className="material-symbols-outlined text-emerald-600" style={{ fontSize: 56 }}>schedule</span><p className="mt-4 text-sm text-slate-500">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p><div className="mt-2 text-4xl font-bold text-slate-900">{formatTime(new Date())}</div></div><div className="grid gap-3 sm:grid-cols-2"><button disabled={loading || !!attendance?.clockInAt} onClick={() => clock('clock_in')} className="rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Clock In</button><button disabled={loading || !attendance?.clockInAt || !!attendance?.clockOutAt} onClick={() => clock('clock_out')} className="rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Clock Out</button></div>{message && <p className="mt-5 text-center text-sm text-slate-600">{message}</p>}<dl className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-200 pt-5 text-sm"><div><dt className="text-slate-500">Masuk</dt><dd className="mt-1 font-semibold">{formatTime(attendance?.clockInAt)}</dd></div><div><dt className="text-slate-500">Pulang</dt><dd className="mt-1 font-semibold">{formatTime(attendance?.clockOutAt)}</dd></div></dl></section></EmployeeShell>
}