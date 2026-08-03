'use client'

import { useEffect, useState } from 'react'
import EmployeeShell from '@/components/employee/EmployeeShell'

export default function AttendanceHistoryPage() {
  const [rows, setRows] = useState([])
  useEffect(() => { fetch('/api/employee/attendance-history').then((response) => response.json()).then((data) => setRows(data.attendances || [])) }, [])
  return <EmployeeShell><header className="mb-8"><h1 className="text-2xl font-semibold">Riwayat Presensi</h1><p className="mt-1 text-sm text-slate-500">Daftar kehadiran Anda berdasarkan periode berjalan.</p></header><section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-6 py-4">Tanggal</th><th className="px-6 py-4">Masuk</th><th className="px-6 py-4">Pulang</th><th className="px-6 py-4">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.id}><td className="px-6 py-4">{new Date(row.attendanceDate).toLocaleDateString('id-ID')}</td><td className="px-6 py-4">{row.clockInAt ? new Date(row.clockInAt).toLocaleTimeString('id-ID') : '-'}</td><td className="px-6 py-4">{row.clockOutAt ? new Date(row.clockOutAt).toLocaleTimeString('id-ID') : '-'}</td><td className="px-6 py-4"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{row.status}</span></td></tr>)}</tbody></table></div>{rows.length === 0 && <p className="p-12 text-center text-sm text-slate-500">Belum ada riwayat presensi.</p>}</section></EmployeeShell>
}