'use client'

import { useEffect, useState } from 'react'
import EmployeeShell from '@/components/employee/EmployeeShell'

export default function FaceRegistrationPage() {
  const [registered, setRegistered] = useState(false); const [descriptor, setDescriptor] = useState(''); const [message, setMessage] = useState('')
  useEffect(() => { fetch('/api/employee/face-registration').then((response) => response.json()).then((data) => setRegistered(!!data.registeredAt)) }, [])
  const submit = async (event) => { event.preventDefault(); const response = await fetch('/api/employee/face-registration', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ descriptor }) }); const data = await response.json(); setMessage(data.message); if (response.ok) setRegistered(true) }
  return <EmployeeShell><header className="mb-8"><h1 className="text-2xl font-semibold">Pendaftaran Wajah</h1><p className="mt-1 text-sm text-slate-500">Daftarkan descriptor wajah untuk presensi berbasis face recognition.</p></header><section className="max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm"><div className={`rounded-lg p-4 text-sm ${registered ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{registered ? 'Wajah sudah terdaftar.' : 'Wajah belum terdaftar.'}</div><form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm font-medium">Descriptor wajah<textarea required rows="6" value={descriptor} onChange={(e) => setDescriptor(e.target.value)} placeholder="Tempel JSON descriptor dari kamera" className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label><button className="rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white">Simpan Descriptor</button>{message && <p className="text-sm text-slate-600">{message}</p>}</form></section></EmployeeShell>
}