'use client'

import { useEffect, useState } from 'react'
import RoleShell from './RoleShell'
import { formatTime, formatTimeInput } from '@/lib/utils'

const emptyForm = { employeeId: '', attendanceDate: '', clockInAt: '', clockOutAt: '', reason: '' }

function getToday() {
  const today = new Date()
  const offset = today.getTimezoneOffset() * 60000
  return new Date(today.getTime() - offset).toISOString().slice(0, 10)
}

function TimePicker({ label, value, onChange }) {
  const [hours = '', minutes = ''] = value ? value.split(':') : []
  const update = (part, nextValue) => {
    const nextHours = part === 'hours' ? nextValue : hours
    const nextMinutes = part === 'minutes' ? nextValue : minutes
    onChange(nextHours && nextMinutes ? `${nextHours}:${nextMinutes}` : '')
  }

  return <div><span className="text-xs text-slate-500">{label}</span><div className="mt-1 flex items-center gap-1"><select aria-label={`${label} jam`} value={hours} onChange={(event) => update('hours', event.target.value)} className="field w-full"><option value="">Jam</option>{Array.from({ length: 24 }, (_, hour) => <option key={hour} value={String(hour).padStart(2, '0')}>{String(hour).padStart(2, '0')}</option>)}</select><span className="font-semibold text-slate-500">:</span><select aria-label={`${label} menit`} value={minutes} onChange={(event) => update('minutes', event.target.value)} className="field w-full"><option value="">Menit</option>{Array.from({ length: 60 }, (_, minute) => <option key={minute} value={String(minute).padStart(2, '0')}>{String(minute).padStart(2, '0')}</option>)}</select></div></div>
}

function auditValue(value) {
  if (!value) return '-'
  try {
    const parsed = JSON.parse(value)
    return Object.entries(parsed).map(([key, item]) => `${key}: ${item ? (key.includes('At') || key === 'attendanceDate' ? new Date(item).toLocaleString('id-ID', { hour12: false }) : item) : '-'}`).join(' | ')
  } catch {
    return value
  }
}

export default function AttendancesPage() {
  const [attendances, setAttendances] = useState([])
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [filterDate, setFilterDate] = useState(getToday)
  const [filterStatus, setFilterStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [summary, setSummary] = useState({})
  const [editing, setEditing] = useState(null)
  const [audit, setAudit] = useState(null)
  const [auditLoading, setAuditLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadData = (date = filterDate) => { const params = new URLSearchParams({ date }); if (filterStatus) params.set('status', filterStatus); if (searchQuery.trim()) params.set('q', searchQuery.trim()); return Promise.all([fetch(`/api/hr/attendances?${params}`), fetch('/api/hr/employees')]).then(async ([attendanceResponse, employeeResponse]) => {
    const attendanceData = await attendanceResponse.json()
    const employeeData = await employeeResponse.json()
    if (!attendanceResponse.ok) throw new Error(attendanceData.message)
    if (!employeeResponse.ok) throw new Error(employeeData.message)
    setAttendances(attendanceData.attendances || [])
    setSummary(attendanceData.summary || {})
    setEmployees(employeeData.employees || [])
  }).catch((requestError) => setError(requestError.message)) }

  useEffect(() => {
    fetch('/api/auth/me').then((response) => response.json()).then((data) => setUser(data.user))
  }, [])

  useEffect(() => {
    loadData(filterDate)
  }, [filterDate, filterStatus, searchQuery])

  const submit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    const endpoint = editing ? `/api/hr/attendances/${editing.id}` : '/api/hr/attendances'
    const response = await fetch(endpoint, { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await response.json()
    if (!response.ok) return setError(data.message)
    await loadData(filterDate)
    setMessage(data.message)
    setForm(emptyForm)
    setEditing(null)
    setAudit(null)
  }

  const edit = (attendance) => {
    setEditing(attendance)
    setMessage('')
    setError('')
    setForm({ employeeId: attendance.employeeId?.toString() || '', attendanceDate: new Date(attendance.attendanceDate).toISOString().slice(0, 10), clockInAt: formatTimeInput(attendance.clockInAt), clockOutAt: formatTimeInput(attendance.clockOutAt), reason: '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const viewAudit = async (attendance) => {
    setAuditLoading(true)
    setError('')
    const response = await fetch(`/api/hr/attendances/${attendance.id}`)
    const data = await response.json()
    setAuditLoading(false)
    if (!response.ok) return setError(data.message)
    setAudit({ attendance, logs: data.logs || [] })
  }

  const exportCsv = async () => {
    setExporting(true)
    setError('')
    const response = await fetch(`/api/hr/exports?type=attendances&date=${filterDate}`)
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      setError(data.message || 'Export presensi gagal.')
      setExporting(false)
      return
    }
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `presensi-${filterDate}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  const cancelEdit = () => { setEditing(null); setForm(emptyForm); setMessage('') }

  return <RoleShell user={user}>
    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-2xl font-bold text-slate-950">Presensi Employee</h1><p className="mt-1 text-sm text-slate-500">Pantau dan catat presensi employee secara manual.</p></div><button type="button" onClick={exportCsv} disabled={exporting} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">{exporting ? 'Menyiapkan...' : 'Export CSV'}</button></header>
    {message && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
    {error && <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-semibold text-slate-950">{editing ? 'Edit Presensi' : 'Catat Presensi Manual'}</h2>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <select required disabled={Boolean(editing)} value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })} className="field disabled:bg-slate-100"><option value="">Pilih employee</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName} · {employee.employeeNumber}</option>)}</select>
        <input required type="date" value={form.attendanceDate} onChange={(event) => setForm({ ...form, attendanceDate: event.target.value })} className="field" />
        <TimePicker label="Jam masuk" value={form.clockInAt} onChange={(clockInAt) => setForm({ ...form, clockInAt })} />
        <TimePicker label="Jam pulang" value={form.clockOutAt} onChange={(clockOutAt) => setForm({ ...form, clockOutAt })} />
        <input placeholder="Alasan perubahan (opsional)" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} className="field" />
        <div className="flex gap-2 sm:col-span-2 lg:col-span-1"><button className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">{editing ? 'Simpan Edit' : 'Simpan Presensi'}</button>{editing && <button type="button" onClick={cancelEdit} className="rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Batal</button>}</div>
      </form>
    </section>
    <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <label htmlFor="attendance-filter-date" className="text-sm font-semibold text-slate-700">Tanggal<input id="attendance-filter-date" type="date" value={filterDate} onChange={(event) => setFilterDate(event.target.value)} className="field mt-1" /></label>
        <label htmlFor="attendance-filter-search" className="text-sm font-semibold text-slate-700">Cari employee<input id="attendance-filter-search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="field mt-1" placeholder="Nama, nomor, atau divisi" /></label>
        <label htmlFor="attendance-filter-status" className="text-sm font-semibold text-slate-700">Status<select id="attendance-filter-status" value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} className="field mt-1"><option value="">Semua status</option><option value="present">Hadir</option><option value="late">Terlambat</option><option value="no_checkout">Belum checkout</option><option value="absent">Tidak hadir</option></select></label>
      </div>
      <p className="mt-3 text-xs text-slate-500">Filter diterapkan otomatis pada data presensi.</p>
    </section>
    <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[['present', 'Hadir', 'bg-cyan-50 text-cyan-700'], ['late', 'Terlambat', 'bg-orange-50 text-orange-700'], ['no_checkout', 'Belum checkout', 'bg-amber-50 text-amber-700'], ['absent', 'Tidak hadir', 'bg-slate-100 text-slate-700']].map(([key, label, tone]) => <article key={key} className={`rounded-xl border border-slate-200 p-4 ${tone}`}><p className="text-xs font-semibold uppercase tracking-wide">{label}</p><p className="mt-2 text-2xl font-bold">{summary[key] || 0}</p></article>)}
    </section>
    <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"><table className="w-full min-w-[760px] text-left text-xs sm:text-sm [&_th]:px-3 [&_th]:py-3 sm:[&_th]:px-5 sm:[&_th]:py-4 [&_td]:px-3 [&_td]:py-3 sm:[&_td]:px-5 sm:[&_td]:py-4"><thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs"><tr><th className="whitespace-nowrap">Tanggal</th><th className="whitespace-nowrap">Employee</th><th className="whitespace-nowrap">Masuk</th><th className="whitespace-nowrap">Pulang</th><th className="whitespace-nowrap">Status</th><th className="whitespace-nowrap">Sumber</th><th className="whitespace-nowrap">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{attendances.map((item) => <tr key={item.id}><td className="whitespace-nowrap">{new Date(item.attendanceDate).toLocaleDateString('id-ID')}</td><td className="max-w-[140px] break-words font-semibold">{item.employee?.fullName || '-'}</td><td className="whitespace-nowrap">{formatTime(item.clockInAt)}</td><td className="whitespace-nowrap">{formatTime(item.clockOutAt)}</td><td className="capitalize">{item.status}</td><td className="capitalize">{item.source}</td><td><div className="flex min-w-[130px] flex-col gap-2 sm:min-w-0 sm:flex-row"><button onClick={() => edit(item)} className="min-h-10 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">Edit</button><button onClick={() => viewAudit(item)} className="min-h-10 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200">Audit</button></div></td></tr>)}</tbody></table>{attendances.length === 0 && <p className="p-10 text-center text-sm text-slate-500">Belum ada data presensi.</p>}</section>
    {audit && <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold text-slate-950">Riwayat Audit Presensi</h2><p className="mt-1 text-sm text-slate-500">{audit.attendance.employee?.fullName || 'Employee'} · {new Date(audit.attendance.attendanceDate).toLocaleDateString('id-ID')}</p></div><button onClick={() => setAudit(null)} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200">Tutup</button></div>{auditLoading ? <p className="mt-5 text-sm text-slate-500">Memuat riwayat...</p> : audit.logs.length === 0 ? <p className="mt-5 text-sm text-slate-500">Belum ada riwayat perubahan.</p> : <div className="mt-5 space-y-3">{audit.logs.map((log) => <article key={log.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4"><div className="flex flex-wrap justify-between gap-2 text-xs text-slate-500"><span>{log.changedByUser?.name || 'User tidak diketahui'} · {log.fieldChanged}</span><time>{new Date(log.createdAt).toLocaleString('id-ID', { hour12: false })}</time></div><p className="mt-2 text-sm text-slate-700">{log.reason || 'Tidak ada alasan.'}</p><p className="mt-2 break-words text-xs text-slate-500">Sebelum: {auditValue(log.oldValue)}</p><p className="break-words text-xs text-slate-500">Sesudah: {auditValue(log.newValue)}</p></article>)}</div>}</section>}
  </RoleShell>
}
