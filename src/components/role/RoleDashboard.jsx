'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import RoleShell from './RoleShell'

function Card({ label, value, href }) {
  return <Link href={href} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-400"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-950">{value}</p></Link>
}

export default function RoleDashboard({ leader = false }) {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({ employees: 0, attendances: 0, absences: 0, reports: 0 })
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([fetch('/api/auth/me'), fetch('/api/hr/employees'), fetch('/api/hr/attendances'), fetch('/api/hr/absence-requests'), fetch('/api/hr/work-reports')]).then(async ([me, employees, attendances, absences, reports]) => {
      const payloads = await Promise.all([me.json(), employees.json(), attendances.json(), absences.json(), reports.json()])
      if (!me.ok) throw new Error(payloads[0].message || 'Sesi tidak valid.')
      setUser(payloads[0].user)
      setStats({ employees: payloads[1].employees?.length || 0, attendances: payloads[2].attendances?.length || 0, absences: payloads[3].requests?.filter((item) => item.status === 'pending').length || 0, reports: payloads[4].reports?.length || 0 })
    }).catch((requestError) => setError(requestError.message))
  }, [])

  const actualLeader = user?.role?.toLowerCase() === 'leader'
  return <RoleShell user={user} leader={actualLeader}><header className="mb-8"><p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Console Management System</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Ringkasan Operasional</h1><p className="mt-2 text-slate-500">Kelola data presensi dan aktivitas employee dari satu tempat.</p>{error && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}</header><section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Card label="Employee aktif" value={stats.employees} href="/hr/employees" /><Card label="Data presensi" value={stats.attendances} href="/hr/attendances" /><Card label="Izin menunggu" value={stats.absences} href="/hr/absence-requests" /><Card label="Laporan kerja" value={stats.reports} href="/hr/work-reports" /></section><section className="mt-8 grid gap-4 md:grid-cols-2"><Link href="/hr/announcements" className="rounded-xl bg-slate-950 p-6 text-white"><p className="text-sm text-white/60">Komunikasi</p><h2 className="mt-2 text-xl font-semibold">Buat pengumuman</h2><p className="mt-2 text-sm text-white/70">Sampaikan informasi terbaru kepada employee.</p></Link>{actualLeader && <Link href="/leader/admins" className="rounded-xl bg-emerald-700 p-6 text-white"><p className="text-sm text-white/70">Manajemen akun</p><h2 className="mt-2 text-xl font-semibold">Kelola akun HR</h2><p className="mt-2 text-sm text-white/80">Atur akun HR aplikasi.</p></Link>}</section></RoleShell>
}
