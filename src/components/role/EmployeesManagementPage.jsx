'use client'

import { useEffect, useState } from 'react'
import RoleShell from './RoleShell'

const emptyForm = { fullName: '', email: '', employeeNumber: '', division: '', position: 'Employee', password: '' }
const positionOptions = ['Employee', 'Intern', 'Staff', 'Supervisor', 'Manager']

function Button({ children, onClick, type = 'button', tone = 'green' }) {
  const toneClass = tone === 'red' ? 'bg-rose-600 hover:bg-rose-700' : tone === 'dark' ? 'bg-slate-900 hover:bg-slate-800' : 'bg-emerald-600 hover:bg-emerald-700'
  return <button type={type} onClick={onClick} className={`min-h-11 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition ${toneClass}`}>{children}</button>
}

export default function EmployeesManagementPage() {
  const [employees, setEmployees] = useState([])
  const [user, setUser] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadEmployees = async () => {
    setLoading(true)
    const response = await fetch('/api/hr/employees')
    const data = await response.json()
    if (response.ok) setEmployees(data.employees || [])
    else setError(data.message || 'Data employee gagal dimuat.')
    setLoading(false)
  }

  useEffect(() => {
    fetch('/api/auth/me').then((response) => response.json()).then((data) => setUser(data.user || null))
    loadEmployees()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setMessage('')
    setError('')
    setModalOpen(true)
  }

  const openEdit = (employee) => {
    setEditing(employee)
    setForm({ fullName: employee.fullName || '', email: employee.user?.email || '', employeeNumber: employee.employeeNumber || '', division: employee.division || '', position: employee.position || 'Employee', password: '' })
    setMessage('')
    setError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    setEditing(null)
    setForm(emptyForm)
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    const endpoint = editing ? `/api/hr/employees/${editing.id}` : '/api/hr/employees'
    const response = await fetch(endpoint, { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await response.json()
    setSaving(false)
    if (!response.ok) {
      setError(data.message || 'Data employee gagal disimpan.')
      return
    }
    setMessage(data.message || 'Employee berhasil disimpan.')
    closeModal()
    loadEmployees()
  }

  const deactivate = async (employee) => {
    if (!window.confirm(`Nonaktifkan ${employee.fullName}?`)) return
    const response = await fetch(`/api/hr/employees/${employee.id}`, { method: 'DELETE' })
    const data = await response.json()
    if (!response.ok) return setError(data.message || 'Employee gagal dinonaktifkan.')
    setMessage(data.message)
    setEmployees((items) => items.filter((item) => item.id !== employee.id))
  }

  return <RoleShell user={user}>
    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-2xl font-bold text-slate-950">Employee</h1><p className="mt-1 text-sm text-slate-500">Kelola data kepegawaian dan akun employee.</p></div><Button onClick={openCreate}><span className="mr-1">+</span>Tambah Employee</Button></header>
    {message && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
    {error && <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"><table className="w-full min-w-[760px] text-left text-xs sm:text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs"><tr><th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4">Nama</th><th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4">Email</th><th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4">Nomor</th><th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4">Divisi</th><th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4">Posisi</th><th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{employees.map((employee) => <tr key={employee.id}><td className="max-w-[140px] break-words px-3 py-3 font-semibold sm:max-w-none sm:px-5 sm:py-4">{employee.fullName}</td><td className="max-w-[180px] break-all px-3 py-3 sm:max-w-none sm:px-5 sm:py-4">{employee.user?.email || '-'}</td><td className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4">{employee.employeeNumber}</td><td className="max-w-[120px] break-words px-3 py-3 sm:max-w-none sm:px-5 sm:py-4">{employee.division}</td><td className="max-w-[120px] break-words px-3 py-3 sm:max-w-none sm:px-5 sm:py-4">{employee.position}</td><td className="px-3 py-3 sm:px-5 sm:py-4"><div className="flex min-w-[170px] flex-col gap-2 sm:min-w-0 sm:flex-row sm:flex-wrap"><Button tone="dark" onClick={() => openEdit(employee)}>Edit</Button><Button tone="red" onClick={() => deactivate(employee)}>Nonaktifkan</Button></div></td></tr>)}</tbody></table>{loading ? <p className="p-10 text-center text-sm text-slate-500">Memuat employee...</p> : employees.length === 0 && <p className="p-10 text-center text-sm text-slate-500">Belum ada employee aktif.</p>}</section>
    {modalOpen && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4"><div role="dialog" aria-modal="true" aria-labelledby="employee-modal-title" className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-2xl sm:rounded-2xl"><div className="flex items-start justify-between gap-4"><div><h2 id="employee-modal-title" className="text-xl font-bold text-slate-950">{editing ? 'Edit Employee' : 'Tambah Employee'}</h2><p className="mt-1 text-sm text-slate-500">{editing ? 'Perbarui data kepegawaian employee.' : 'Buat akun dan profil employee baru.'}</p></div><button type="button" onClick={closeModal} className="material-symbols-outlined rounded-lg p-1 text-slate-500 hover:bg-slate-100" aria-label="Tutup">close</button></div><form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Nama lengkap<input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="field mt-1 w-full" /></label><label className="text-sm font-semibold text-slate-700">Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="field mt-1 w-full" /></label><label className="text-sm font-semibold text-slate-700">Nomor employee<input required value={form.employeeNumber} onChange={(event) => setForm({ ...form, employeeNumber: event.target.value })} className="field mt-1 w-full" /></label><label className="text-sm font-semibold text-slate-700">Divisi<input required value={form.division} onChange={(event) => setForm({ ...form, division: event.target.value })} className="field mt-1 w-full" /></label><label className="text-sm font-semibold text-slate-700">Posisi<select required value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })} className="field mt-1 w-full">{positionOptions.map((position) => <option key={position}>{position}</option>)}</select></label>{!editing && <label className="text-sm font-semibold text-slate-700">Password awal<input required type="password" minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="field mt-1 w-full" /></label>}<div className="flex justify-end gap-2 sm:col-span-2"><button type="button" onClick={closeModal} className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">Batal</button><button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{saving ? 'Menyimpan...' : editing ? 'Simpan Edit' : 'Tambah Employee'}</button></div></form></div></div>}
  </RoleShell>
}
