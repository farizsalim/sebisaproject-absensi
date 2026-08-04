'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import RoleShell from '@/components/role/RoleShell'
import EmployeeShell from '@/components/employee/EmployeeShell'

function Icon({ children, size = 20 }) {
  return <span className="material-symbols-outlined" style={{ fontSize: size }}>{children}</span>
}

function Field({ id, label, type = 'text', value, onChange, placeholder, autoComplete }) {
  return <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
    <input id={id} name={id} type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
  </div>
}

function SaveButton({ children = 'Simpan', onClick }) {
  return <button type="button" onClick={onClick} className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">{children}</button>
}

function AppChrome({ children, user }) {
  const [profileOpen, setProfileOpen] = useState(false)
  return <div className="font-dashboard min-h-screen bg-[#f7f9fb] text-slate-900">
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[280px] flex-col border-r border-slate-200 bg-white shadow-sm md:flex">
      <Link href="/dashboard" className="mb-2 flex items-center gap-3 px-6 py-6"><img src="/images/logo.png" alt="Sebisa Project Absensi" className="h-20 w-20 shrink-0 object-contain" /><div><h1 className="text-base font-bold leading-tight">Sebisa Project Absensi</h1><p className="text-xs font-medium text-slate-500">Employee Portal</p></div></Link>
      <div className="mx-4 mb-4 border-t border-slate-200" />
      <nav className="flex flex-1 flex-col gap-1 px-3"><Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"><Icon>dashboard</Icon>Dashboard</Link><p className="mb-1 mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Aktivitas</p>{[['schedule', 'Presensi', '/employee/clock'], ['photo_camera', 'Pendaftaran Wajah', '/employee/face-registration'], ['history', 'Riwayat', '/employee/attendance-history'], ['event_note', 'Pengajuan Izin', '/employee/absences'], ['edit_note', 'Laporan Kerja', '/employee/work-reports']].map(([icon, label, href]) => <Link key={label} href={href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"><Icon>{icon}</Icon>{label}</Link>)}</nav>
      <div className="mt-auto border-t border-slate-200 px-3 py-4"><button onClick={() => { window.location.href = '/login' }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600"><Icon>logout</Icon>Keluar</button></div>
    </aside>
    <header className="fixed right-0 top-0 z-40 hidden h-16 w-[calc(100%-280px)] items-center justify-end border-b border-slate-200 bg-slate-50/80 px-8 backdrop-blur-md md:flex"><div className="relative"><button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-3"><div className="text-right lg:block"><p className="text-sm font-semibold">{user?.name || 'Memuat...'}</p><p className="text-xs capitalize text-slate-500">{user?.role || ''}</p></div><span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-bold">{user?.name?.slice(0, 2).toUpperCase() || '--'}</span><Icon size={18}>expand_more</Icon></button>{profileOpen && <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-lg"><Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100"><Icon size={18}>dashboard</Icon>Dashboard</Link><button onClick={() => { window.location.href = '/login' }} className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-red-50 hover:text-red-600"><Icon size={18}>logout</Icon>Keluar</button></div>}</div></header>
    <main className="min-h-screen pb-24 pt-8 md:ml-[280px] md:pb-8 md:pt-24"><div className="mx-auto max-w-[1440px] px-6 md:px-8">{children}</div></main>
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200 bg-white px-2 py-2 md:hidden"><Link href="/dashboard" className="flex flex-col items-center gap-1 px-3 py-1 text-slate-500"><Icon size={21}>dashboard</Icon><span className="text-[10px] font-semibold">Dashboard</span></Link><Link href="/employee/clock" className="flex flex-col items-center gap-1 px-3 py-1 text-slate-500"><Icon size={21}>schedule</Icon><span className="text-[10px] font-semibold">Presensi</span></Link><Link href="/notifications" className="flex flex-col items-center gap-1 px-3 py-1 text-slate-500"><Icon size={21}>notifications</Icon><span className="text-[10px] font-semibold">Notifikasi</span></Link><Link href="/profile" className="flex flex-col items-center gap-1 px-3 py-1 text-emerald-700"><Icon size={21}>person</Icon><span className="text-[10px] font-semibold">Profil</span></Link></nav>
  </div>
}

export default function ProfilePage() {
  const [profile, setProfile] = useState({ name: '', email: '' })
  const [user, setUser] = useState(null)
  const [passwords, setPasswords] = useState({ current: '', password: '', confirmation: '' })
  const [saved, setSaved] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [error, setError] = useState('')
  const isRoleProfile = ['hr', 'leader'].includes(user?.role?.toLowerCase())
  const Shell = isRoleProfile ? RoleShell : EmployeeShell

  useEffect(() => { fetch('/api/profile').then((response) => response.json()).then((data) => { if (data.user) { setUser(data.user); setProfile({ name: data.user.name, email: data.user.email }) } }) }, [])

  const saveProfile = async () => { const response = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) }); const data = await response.json(); if (!response.ok) return setError(data.message); setUser(data.user); setSaved('profile'); window.setTimeout(() => setSaved(''), 2000) }
  const savePassword = async () => { const response = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: passwords.current, password: passwords.password, passwordConfirmation: passwords.confirmation }) }); const data = await response.json(); if (!response.ok) return setError(data.message); setError(''); setSaved('password'); setPasswords({ current: '', password: '', confirmation: '' }); window.setTimeout(() => setSaved(''), 2000) }
  const deleteAccount = async () => { const response = await fetch('/api/profile', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: deletePassword }) }); const data = await response.json(); if (!response.ok) return setError(data.message); window.location.href = '/login' }

  return <Shell user={user} leader={user?.role === 'leader'}><section className="mb-6"><h1 className="text-xl font-semibold text-slate-950 md:text-2xl">Profil Saya</h1><p className="mt-1 text-sm text-slate-500">Kelola informasi akun dan keamanan Anda.</p>{error && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}</section><div className="max-w-3xl space-y-6">
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><header className="mb-5 border-b border-slate-200 pb-3"><h2 className="text-lg font-semibold text-slate-950">Informasi Profil</h2><p className="mt-1 text-sm text-slate-500">Perbarui informasi profil dan alamat email akun Anda.</p></header><div className="space-y-5"><Field id="name" label="Nama" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Nama lengkap" autoComplete="name" /><Field id="email" label="Email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="nama@perusahaan.com" autoComplete="username" /><div className="flex items-center gap-4 pt-2"><SaveButton onClick={saveProfile} />{saved === 'profile' && <p className="text-sm text-emerald-600">Tersimpan.</p>}</div></div></section>
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><header className="mb-5 border-b border-slate-200 pb-3"><h2 className="text-lg font-semibold text-slate-950">Ubah Password</h2><p className="mt-1 text-sm text-slate-500">Pastikan akun Anda menggunakan password yang panjang dan acak agar tetap aman.</p></header><div className="space-y-5"><Field id="current" label="Password Saat Ini" type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} placeholder="Masukkan password lama" autoComplete="current-password" /><Field id="password" label="Password Baru" type="password" value={passwords.password} onChange={(e) => setPasswords({ ...passwords, password: e.target.value })} placeholder="Minimal 8 karakter" autoComplete="new-password" /><Field id="confirmation" label="Konfirmasi Password" type="password" value={passwords.confirmation} onChange={(e) => setPasswords({ ...passwords, confirmation: e.target.value })} placeholder="Ulangi password baru" autoComplete="new-password" /><div className="flex items-center gap-4 pt-2"><SaveButton onClick={savePassword} />{saved === 'password' && <p className="text-sm text-emerald-600">Tersimpan.</p>}</div></div></section>
    <section className="rounded-xl border border-rose-200 bg-white p-6 shadow-sm md:p-8"><header><h2 className="text-lg font-semibold text-rose-700">Hapus Akun</h2><p className="mt-1 text-sm text-slate-500">Setelah akun dihapus, semua data dan sumber daya akan dihapus secara permanen. Sebelum menghapus akun, silakan unduh data atau informasi yang ingin Anda simpan.</p></header><button onClick={() => setShowDelete(true)} className="mt-6 inline-flex rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700">Hapus Akun</button></section>
  </div>{showDelete && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4"><div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"><h2 className="text-lg font-semibold text-slate-950">Yakin ingin menghapus akun?</h2><p className="mt-2 text-sm text-slate-500">Masukkan password Anda untuk mengonfirmasi.</p><input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Password" className="mt-5 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20" /><div className="mt-6 flex justify-end gap-3"><button onClick={() => setShowDelete(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Batal</button><button onClick={deleteAccount} className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">Hapus Akun</button></div></div></div>}</Shell>
}