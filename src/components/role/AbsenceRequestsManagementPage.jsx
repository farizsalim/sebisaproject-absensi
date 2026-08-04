'use client'

import { useEffect, useState } from 'react'
import RoleShell from './RoleShell'

function dateText(value) {
  return value ? new Date(value).toLocaleDateString('id-ID', { dateStyle: 'full' }) : '-'
}

export default function AbsenceRequestsManagementPage() {
  const [requests, setRequests] = useState([])
  const [notes, setNotes] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadRequests = async () => {
    setLoading(true)
    const response = await fetch('/api/hr/absence-requests')
    const data = await response.json()
    if (response.ok) {
      setRequests(data.requests || [])
      setNotes(Object.fromEntries((data.requests || []).map((item) => [item.id, item.hrNote || ''])))
    } else setError(data.message || 'Pengajuan izin gagal dimuat.')
    setLoading(false)
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const review = async (request, status) => {
    setSaving(`${request.id}-${status}`)
    setMessage('')
    setError('')
    const response = await fetch(`/api/hr/absence-requests/${request.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, hrNote: notes[request.id] || '' }),
    })
    const data = await response.json()
    setSaving(null)
    if (!response.ok) return setError(data.message || 'Pengajuan izin gagal diproses.')
    setRequests((items) => items.map((item) => item.id === request.id ? { ...item, ...data.absence } : item))
    setMessage(data.message || `Pengajuan berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}.`)
  }

  return <RoleShell>
    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div><h1 className="text-2xl font-bold text-slate-950">Pengajuan Izin</h1><p className="mt-1 text-sm text-slate-500">Tinjau alasan, bukti, dan berikan catatan sebelum memproses pengajuan.</p></div>
      <a href="/api/hr/exports?type=absence-requests" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Export CSV</a>
    </header>
    {message && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
    {error && <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    {loading ? <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Memuat pengajuan...</div> : requests.length === 0 ? <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Belum ada pengajuan izin.</div> : <div className="grid gap-4">{requests.map((request) => <article key={request.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="font-semibold text-slate-950">{request.employee?.fullName || 'Employee'}</h2><p className="mt-1 text-sm capitalize text-slate-500">{request.requestType} · {dateText(request.requestDate)}</p></div><span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${request.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : request.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{request.status}</span></div><div className="mt-4 rounded-lg bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Alasan employee</p><p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">{request.reason}</p>{request.proofFileName && <p className="mt-3 text-sm text-slate-600">Bukti: {request.proofFileName}</p>}</div><label className="mt-4 block text-sm font-semibold text-slate-700">Catatan HR<textarea rows="3" value={notes[request.id] || ''} onChange={(event) => setNotes((items) => ({ ...items, [request.id]: event.target.value }))} className="field mt-1" placeholder="Tambahkan catatan untuk employee" /></label>{request.status === 'pending' && <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={saving !== null} onClick={() => review(request, 'rejected')} className="min-h-11 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50">{saving === `${request.id}-rejected` ? 'Memproses...' : 'Tolak'}</button><button type="button" disabled={saving !== null} onClick={() => review(request, 'approved')} className="min-h-11 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{saving === `${request.id}-approved` ? 'Memproses...' : 'Setujui'}</button></div>}</article>)}</div>}
  </RoleShell>
}
