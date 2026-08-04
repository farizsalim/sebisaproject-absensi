'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import EmployeeShell from '@/components/employee/EmployeeShell'

export default function AbsencesPage() {
  const [rows, setRows] = useState([])
  useEffect(() => { fetch('/api/employee/absences').then((response) => response.json()).then((data) => setRows(data.requests || [])) }, [])
  return <EmployeeShell><header className="mb-8 flex items-end justify-between gap-4"><div><h1 className="text-2xl font-semibold">Pengajuan Izin</h1><p className="mt-1 text-sm text-slate-500">Kelola pengajuan izin dan cuti Anda.</p></div><Link href="/employee/absences/create" className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">Ajukan Izin</Link></header><section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-6 py-4">Jenis</th><th className="px-6 py-4">Tanggal</th><th className="px-6 py-4">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.id}><td className="px-6 py-4 font-medium">{row.requestType}</td><td className="px-6 py-4">{new Date(row.requestDate).toLocaleDateString('id-ID')}</td><td className="px-6 py-4">{row.status}</td></tr>)}</tbody></table>{rows.length === 0 && <p className="p-12 text-center text-sm text-slate-500">Belum ada pengajuan.</p>}</section></EmployeeShell>
}