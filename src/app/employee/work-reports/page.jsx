'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import EmployeeShell from '@/components/employee/EmployeeShell'

export default function WorkReportsPage() {
  const [rows, setRows] = useState([])
  useEffect(() => { fetch('/api/employee/work-reports').then((response) => response.json()).then((data) => setRows(data.reports || [])) }, [])
  return <EmployeeShell><header className="mb-8 flex items-end justify-between gap-4"><div><h1 className="text-2xl font-semibold">Laporan Kerja</h1><p className="mt-1 text-sm text-slate-500">Catat aktivitas kerja harian Anda.</p></div><Link href="/employee/work-reports/create" className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">Buat Laporan</Link></header><div className="grid gap-4">{rows.map((row) => <article key={row.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex justify-between gap-4"><div><h2 className="font-semibold">{row.title}</h2><p className="mt-1 text-sm text-slate-500">{new Date(row.reportDate).toLocaleDateString('id-ID')}</p></div><span className="text-xs text-slate-500">{row.workStartAt?.slice?.(11, 16) || '-'} - {row.workEndAt?.slice?.(11, 16) || '-'}</span></div><p className="mt-4 text-sm text-slate-600">{row.description}</p></article>)}{rows.length === 0 && <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Belum ada laporan kerja.</div>}</div></EmployeeShell>
}