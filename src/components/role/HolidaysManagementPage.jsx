'use client'

import { useEffect, useState } from 'react'
import RoleShell from './RoleShell'

const emptyForm = { name: '', holidayDate: '', notes: '' }

function dateValue(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : ''
}

export default function HolidaysManagementPage() {
  const [holidays, setHolidays] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadHolidays = async () => {
    setLoading(true)
    const response = await fetch('/api/hr/public-holidays')
    const data = await response.json()
    if (response.ok) setHolidays(data.holidays || [])
    else setError(data.message || 'Hari libur gagal dimuat.')
    setLoading(false)
  }

  useEffect(() => {
    loadHolidays()
  }, [])

  const reset = () => {
    setEditing(null)
    setForm(emptyForm)
  }

  const edit = (holiday) => {
    setEditing(holiday)
    setForm({ name: holiday.name || '', holidayDate: dateValue(holiday.holidayDate), notes: holiday.notes || '' })
    setMessage('')
    setError('')
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    const endpoint = editing ? `/api/hr/public-holidays/${editing.id}` : '/api/hr/public-holidays'
    const response = await fetch(endpoint, {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await response.json()
    setSaving(false)
    if (!response.ok) return setError(data.message || 'Hari libur gagal disimpan.')
    setMessage(data.message || 'Hari libur berhasil disimpan.')
    reset()
    await loadHolidays()
  }

  const remove = async (holiday) => {
    if (!window.confirm(`Hapus hari libur ${holiday.name}?`)) return
    setError('')
    const response = await fetch(`/api/hr/public-holidays/${holiday.id}`, { method: 'DELETE' })
    const data = await response.json()
    if (!response.ok) return setError(data.message || 'Hari libur gagal dihapus.')
    setMessage(data.message || 'Hari libur berhasil dihapus.')
    setHolidays((items) => items.filter((item) => item.id !== holiday.id))
  }

  return <RoleShell>
    <header className="mb-7">
      <h1 className="text-2xl font-bold text-slate-950">Hari Libur</h1>
      <p className="mt-1 text-sm text-slate-500">Kelola kalender hari libur perusahaan.</p>
    </header>
    {message && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
    {error && <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-950">{editing ? 'Edit hari libur' : 'Tambah hari libur'}</h2>
          <p className="mt-1 text-sm text-slate-500">{editing ? 'Perbarui informasi hari libur.' : 'Tambahkan tanggal libur ke kalender perusahaan.'}</p>
        </div>
        {editing && <button type="button" onClick={reset} className="min-h-10 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200">Batal</button>}
      </div>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_220px_1fr_auto] lg:items-end">
        <label className="text-sm font-semibold text-slate-700">Nama hari libur<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="field mt-1" placeholder="Contoh: Hari Kemerdekaan" /></label>
        <label className="text-sm font-semibold text-slate-700">Tanggal<input required type="date" value={form.holidayDate} onChange={(event) => setForm({ ...form, holidayDate: event.target.value })} className="field mt-1" /></label>
        <label className="text-sm font-semibold text-slate-700">Catatan<input value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="field mt-1" placeholder="Opsional" /></label>
        <button disabled={saving} className="min-h-11 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{saving ? 'Menyimpan...' : editing ? 'Simpan Edit' : 'Tambah'}</button>
      </form>
    </section>
    <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      {loading ? <p className="p-10 text-center text-sm text-slate-500">Memuat hari libur...</p> : holidays.length === 0 ? <p className="p-10 text-center text-sm text-slate-500">Belum ada hari libur.</p> : <table className="w-full min-w-[620px] text-left text-xs sm:text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 sm:text-xs"><tr><th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4">Tanggal</th><th className="px-3 py-3 sm:px-5 sm:py-4">Nama</th><th className="px-3 py-3 sm:px-5 sm:py-4">Catatan</th><th className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{holidays.map((holiday) => <tr key={holiday.id}><td className="whitespace-nowrap px-3 py-3 sm:px-5 sm:py-4">{new Date(holiday.holidayDate).toLocaleDateString('id-ID')}</td><td className="px-3 py-3 font-semibold sm:px-5 sm:py-4">{holiday.name}</td><td className="max-w-xs break-words px-3 py-3 text-slate-600 sm:px-5 sm:py-4">{holiday.notes || '-'}</td><td className="px-3 py-3 sm:px-5 sm:py-4"><div className="flex flex-col gap-2 sm:flex-row"><button type="button" onClick={() => edit(holiday)} className="min-h-10 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">Edit</button><button type="button" onClick={() => remove(holiday)} className="min-h-10 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700">Hapus</button></div></td></tr>)}</tbody></table>}
    </section>
  </RoleShell>
}
