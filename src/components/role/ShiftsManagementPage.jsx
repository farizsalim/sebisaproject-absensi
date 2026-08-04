'use client'

import { useEffect, useState } from 'react'
import RoleShell from './RoleShell'

const days = [['1', 'Sen'], ['2', 'Sel'], ['3', 'Rab'], ['4', 'Kam'], ['5', 'Jum'], ['6', 'Sab'], ['7', 'Min']]
const emptyForm = { employeeId: '', name: '', clockInDeadline: '09:00', clockOutDeadline: '17:00', effectiveFrom: '', effectiveTo: '', workDays: ['1', '2', '3', '4', '5'], isActive: true }

function dateValue(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : ''
}

function timeValue(value) {
  return value ? new Date(value).toISOString().slice(11, 16) : ''
}

function dayValues(value) {
  return String(value || '').split(',').filter(Boolean)
}

function TimePicker({ id, label, value, onChange }) {
  const [open, setOpen] = useState(false)
  const [hours = '', minutes = ''] = value ? value.split(':') : []
  const choose = (part, nextValue) => {
    const nextHours = part === 'hours' ? nextValue : hours
    const nextMinutes = part === 'minutes' ? nextValue : minutes
    onChange(nextHours && nextMinutes ? `${nextHours}:${nextMinutes}` : `${nextHours || '00'}:${nextMinutes || '00'}`)
  }

  return <div className="relative text-sm font-semibold text-slate-700"><label htmlFor={id}>{label}</label><button id={id} type="button" onClick={() => setOpen(!open)} onKeyDown={(event) => { if (event.key === 'Escape') { setOpen(false); event.preventDefault() } }} aria-expanded={open} aria-haspopup="listbox" aria-label={`${label}, ${value || 'belum dipilih'}`} className="field mt-1 flex w-full items-center justify-between text-left font-normal"><span className={value ? 'text-slate-900' : 'text-slate-600'}>{value || 'Pilih jam'}</span><span aria-hidden="true" className="material-symbols-outlined text-[18px] text-slate-500">schedule</span></button>{open && <div role="group" aria-label={`Pilihan ${label.toLowerCase()}`} onKeyDown={(event) => { if (event.key === 'Escape') { setOpen(false); event.preventDefault() } }} className="absolute left-0 top-full z-20 mt-2 w-full min-w-[250px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl"><div className="grid grid-cols-2 gap-3"><div role="group" aria-label="Jam"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-700">Jam</p><div className="grid max-h-48 grid-cols-1 gap-1 overflow-y-auto">{Array.from({ length: 24 }, (_, hour) => { const item = String(hour).padStart(2, '0'); return <button type="button" role="option" aria-selected={hours === item} key={item} onClick={() => choose('hours', item)} className={`rounded-md px-1 py-2 text-xs font-semibold ${hours === item ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-emerald-50'}`}>{item}</button> })}</div></div><div role="group" aria-label="Menit"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-700">Menit</p><div className="grid max-h-48 grid-cols-1 gap-1 overflow-y-auto">{Array.from({ length: 60 }, (_, minute) => { const item = String(minute).padStart(2, '0'); return <button type="button" role="option" aria-selected={minutes === item} key={item} onClick={() => choose('minutes', item)} className={`rounded-md px-1 py-2 text-xs font-semibold ${minutes === item ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-emerald-50'}`}>{item}</button> })}</div></div></div><button type="button" onClick={() => setOpen(false)} aria-label={`Tutup pilihan ${label.toLowerCase()}`} className="mt-3 w-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">Selesai</button></div>}</div>
}

export default function ShiftsManagementPage() {
  const [shifts, setShifts] = useState([])
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadData = async () => {
    setLoading(true)
    const [shiftResponse, employeeResponse] = await Promise.all([fetch('/api/hr/shifts'), fetch('/api/hr/employees')])
    const shiftData = await shiftResponse.json()
    const employeeData = await employeeResponse.json()
    if (!shiftResponse.ok) setError(shiftData.message || 'Shift gagal dimuat.')
    if (!employeeResponse.ok) setError(employeeData.message || 'Employee gagal dimuat.')
    if (shiftResponse.ok) setShifts(shiftData.shifts || [])
    if (employeeResponse.ok) setEmployees(employeeData.employees || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const reset = () => { setEditing(null); setForm(emptyForm) }
  const edit = (shift) => {
    setEditing(shift)
    setForm({ employeeId: shift.employeeId?.toString() || '', name: shift.name || '', clockInDeadline: timeValue(shift.clockInDeadline), clockOutDeadline: timeValue(shift.clockOutDeadline), effectiveFrom: dateValue(shift.effectiveFrom), effectiveTo: dateValue(shift.effectiveTo), workDays: dayValues(shift.workDays), isActive: shift.isActive })
    setMessage('')
    setError('')
  }
  const toggleDay = (day) => setForm((current) => ({ ...current, workDays: current.workDays.includes(day) ? current.workDays.filter((item) => item !== day) : [...current.workDays, day].sort() }))
  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    const endpoint = editing ? `/api/hr/shifts/${editing.id}` : '/api/hr/shifts'
    const response = await fetch(endpoint, { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await response.json()
    setSaving(false)
    if (!response.ok) return setError(data.message || 'Shift gagal disimpan.')
    setMessage(data.message || 'Shift berhasil disimpan.')
    reset()
    await loadData()
  }
  const remove = async (shift) => {
    if (!window.confirm(`Hapus shift ${shift.name} untuk ${shift.employee?.fullName || 'employee'}?`)) return
    const response = await fetch(`/api/hr/shifts/${shift.id}`, { method: 'DELETE' })
    const data = await response.json()
    if (!response.ok) return setError(data.message || 'Shift gagal dihapus.')
    setMessage(data.message || 'Shift berhasil dihapus.')
    setShifts((items) => items.filter((item) => item.id !== shift.id))
  }

  return <RoleShell>
    <header className="mb-7"><h1 className="text-2xl font-bold text-slate-950">Jadwal Shift</h1><p className="mt-1 text-sm text-slate-500">Atur batas waktu presensi berdasarkan jadwal employee.</p></header>
    {message && <p role="status" aria-live="polite" className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
    {error && <p role="alert" aria-live="assertive" className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-950">{editing ? 'Edit jadwal shift' : 'Tambah jadwal shift'}</h2><p className="mt-1 text-sm text-slate-500">Jadwal ini menjadi acuan aturan terlambat dan pulang lebih awal.</p></div>{editing && <button type="button" onClick={reset} className="min-h-10 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200">Batal</button>}</div>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-semibold text-slate-700">Employee<select required value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })} className="field mt-1"><option value="">Pilih employee</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName} · {employee.employeeNumber}</option>)}</select></label>
        <label className="text-sm font-semibold text-slate-700">Nama shift<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="field mt-1" placeholder="Contoh: Shift Pagi" /></label>
        <TimePicker id="shift-clock-in" label="Batas clock in" value={form.clockInDeadline} onChange={(clockInDeadline) => setForm({ ...form, clockInDeadline })} />
        <TimePicker id="shift-clock-out" label="Batas clock out" value={form.clockOutDeadline} onChange={(clockOutDeadline) => setForm({ ...form, clockOutDeadline })} />
        <label className="text-sm font-semibold text-slate-700">Mulai berlaku<input required type="date" value={form.effectiveFrom} onChange={(event) => setForm({ ...form, effectiveFrom: event.target.value })} className="field mt-1" /></label>
        <label className="text-sm font-semibold text-slate-700">Berakhir (opsional)<input type="date" value={form.effectiveTo} onChange={(event) => setForm({ ...form, effectiveTo: event.target.value })} className="field mt-1" /></label>
        <fieldset className="sm:col-span-2"><legend className="text-sm font-semibold text-slate-700">Hari kerja</legend><div className="mt-2 flex flex-wrap gap-2">{days.map(([value, label]) => <label key={value} className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${form.workDays.includes(value) ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500'}`}><input type="checkbox" checked={form.workDays.includes(value)} onChange={() => toggleDay(value)} className="accent-emerald-600" />{label}</label>)}</div></fieldset>
        <label className="flex min-h-10 items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} className="h-4 w-4 accent-emerald-600" />Shift aktif</label>
        <div className="flex items-end sm:col-span-2 lg:col-span-4"><button disabled={saving} aria-busy={saving} className="min-h-11 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:opacity-70 sm:w-auto">{saving ? 'Menyimpan...' : editing ? 'Simpan perubahan' : 'Tambah shift'}</button></div>
      </form>
    </section>
    <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">{loading ? <p className="p-10 text-center text-sm text-slate-500">Memuat jadwal shift...</p> : shifts.length === 0 ? <p className="p-10 text-center text-sm text-slate-500">Belum ada jadwal shift.</p> : <table className="w-full min-w-[900px] text-left text-xs sm:text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs"><tr><th className="px-3 py-3 sm:px-5 sm:py-4">Employee</th><th className="px-3 py-3 sm:px-5 sm:py-4">Shift</th><th className="px-3 py-3 sm:px-5 sm:py-4">Jam</th><th className="px-3 py-3 sm:px-5 sm:py-4">Periode</th><th className="px-3 py-3 sm:px-5 sm:py-4">Hari</th><th className="px-3 py-3 sm:px-5 sm:py-4">Status</th><th className="px-3 py-3 sm:px-5 sm:py-4">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{shifts.map((shift) => <tr key={shift.id}><td className="px-3 py-3 sm:px-5 sm:py-4"><p className="font-semibold">{shift.employee?.fullName || '-'}</p><p className="text-xs text-slate-500">{shift.employee?.employeeNumber || '-'}</p></td><td className="px-3 py-3 font-semibold sm:px-5 sm:py-4">{shift.name}</td><td className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4">{timeValue(shift.clockInDeadline)} - {timeValue(shift.clockOutDeadline)}</td><td className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4">{dateValue(shift.effectiveFrom)}{shift.effectiveTo ? ` s/d ${dateValue(shift.effectiveTo)}` : ' s/d sekarang'}</td><td className="px-3 py-3 sm:px-5 sm:py-4">{dayValues(shift.workDays).map((day) => days.find(([value]) => value === day)?.[1]).join(', ')}</td><td className="px-3 py-3 sm:px-5 sm:py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${shift.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{shift.isActive ? 'Aktif' : 'Nonaktif'}</span></td><td className="px-3 py-3 sm:px-5 sm:py-4"><div className="flex flex-col gap-2 sm:flex-row"><button type="button" onClick={() => edit(shift)} className="min-h-10 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">Edit</button><button type="button" onClick={() => remove(shift)} className="min-h-10 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700">Hapus</button></div></td></tr>)}</tbody></table>}</section>
  </RoleShell>
}
