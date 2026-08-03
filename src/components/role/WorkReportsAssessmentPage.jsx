'use client'

import { useEffect, useState } from 'react'
import RoleShell from './RoleShell'

export default function WorkReportsAssessmentPage() {
  const [reports, setReports] = useState([])
  const [forms, setForms] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadReports = async () => {
    setLoading(true)
    const response = await fetch('/api/hr/work-reports')
    const data = await response.json()
    if (!response.ok) {
      setError(data.message || 'Laporan kerja gagal dimuat.')
      setLoading(false)
      return
    }
    const enriched = await Promise.all((data.reports || []).map(async (report) => {
      const assessmentResponse = await fetch(`/api/hr/work-reports/${report.id}/assessment`)
      const assessmentData = await assessmentResponse.json()
      return { ...report, assessment: assessmentResponse.ok ? assessmentData.assessment : null }
    }))
    setReports(enriched)
    setForms(Object.fromEntries(enriched.map((report) => [report.id, { score: report.assessment?.projectScore?.toString() || '', reviewNote: report.assessment?.notes || '' }])))
    setLoading(false)
  }

  useEffect(() => {
    loadReports()
  }, [])

  const updateForm = (id, field, value) => setForms((items) => ({ ...items, [id]: { ...items[id], [field]: value } }))

  const saveAssessment = async (report) => {
    setSaving(report.id)
    setMessage('')
    setError('')
    const form = forms[report.id] || {}
    const response = await fetch(`/api/hr/work-reports/${report.id}/assessment`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ score: form.score, review_note: form.reviewNote }) })
    const data = await response.json()
    if (!response.ok) {
      setError(data.message || 'Assessment gagal disimpan.')
      setSaving(null)
      return
    }
    setReports((items) => items.map((item) => item.id === report.id ? { ...item, assessment: data.assessment } : item))
    setMessage(data.message)
    setSaving(null)
  }

  const exportCsv = async () => {
    const response = await fetch('/api/hr/exports?type=work-reports')
    if (!response.ok) return setError('Export laporan gagal.')
    const url = URL.createObjectURL(await response.blob())
    const link = document.createElement('a')
    link.href = url
    link.download = 'laporan-kerja.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return <RoleShell>
    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-2xl font-bold text-slate-950">Laporan Kerja</h1><p className="mt-1 text-sm text-slate-500">Review laporan kerja dan berikan assessment employee.</p></div><button type="button" onClick={exportCsv} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Export CSV</button></header>
    {message && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
    {error && <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    {loading ? <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Memuat laporan...</div> : reports.length === 0 ? <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Belum ada laporan kerja.</div> : <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"><table className="w-full min-w-[980px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Employee</th><th className="px-5 py-4">Tanggal</th><th className="px-5 py-4">Laporan</th><th className="px-5 py-4">Nilai (0-100)</th><th className="px-5 py-4">Catatan HR</th><th className="px-5 py-4">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{reports.map((report) => <tr key={report.id} className="align-top"><td className="px-5 py-4 font-semibold">{report.employee?.fullName || '-'}</td><td className="px-5 py-4">{new Date(report.reportDate).toLocaleDateString('id-ID')}</td><td className="max-w-sm px-5 py-4"><p className="font-semibold">{report.title}</p><p className="mt-1 text-slate-600">{report.description}</p></td><td className="px-5 py-4"><input type="number" min="0" max="100" step="0.01" placeholder="0-100" value={forms[report.id]?.score || ''} onChange={(event) => updateForm(report.id, 'score', event.target.value)} className="field w-28" /></td><td className="px-5 py-4"><textarea rows="2" placeholder="Catatan penilaian" value={forms[report.id]?.reviewNote || ''} onChange={(event) => updateForm(report.id, 'reviewNote', event.target.value)} className="field min-w-52" /></td><td className="px-5 py-4"><button type="button" onClick={() => saveAssessment(report)} disabled={saving === report.id} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{saving === report.id ? 'Menyimpan...' : 'Simpan Nilai'}</button></td></tr>)}</tbody></table></section>}
  </RoleShell>
}
