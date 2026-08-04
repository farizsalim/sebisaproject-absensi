'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const hrLinks = [
  ['dashboard', 'Ringkasan', '/console'],
  ['groups', 'Employee', '/hr/employees'],
  ['event_available', 'Presensi', '/hr/attendances'],
  ['schedule', 'Jadwal Shift', '/hr/shifts'],
  ['rule', 'Pengajuan Izin', '/hr/absence-requests'],
  ['description', 'Laporan Kerja', '/hr/work-reports'],
  ['campaign', 'Pengumuman', '/hr/announcements'],
  ['event', 'Hari Libur', '/hr/public-holidays'],
]

let cachedUser = null

export default function RoleShell({ children, user, leader = false }) {
  const pathname = usePathname()
  const [authenticatedUser, setAuthenticatedUser] = useState(() => user || cachedUser)
  const [profileOpen, setProfileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  useEffect(() => {
    if (user) {
      cachedUser = user
      return
    }
    if (cachedUser) {
      return
    }
    fetch('/api/auth/me').then((response) => response.json()).then((data) => {
      cachedUser = data.user || null
      setAuthenticatedUser(cachedUser)
    })
  }, [user])
  const currentUser = user || authenticatedUser
  const actualLeader = currentUser?.role?.toLowerCase() === 'leader'
  const links = actualLeader ? [...hrLinks, ['admin_panel_settings', 'Manajemen Akun HR', '/leader/admins']] : hrLinks
  useEffect(() => {
    if (!currentUser?.role) return
    if (leader && !actualLeader) window.location.replace('/console')
  }, [actualLeader, currentUser, leader])
  const icon = (name, size = 20) => <span className="material-symbols-outlined" style={{ fontSize: size }}>{name}</span>
  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/login' }
  const mobileLinks = links.slice(0, 4)
  const isActive = (href) => pathname === href || (href !== '/console' && pathname.startsWith(`${href}/`))

  return <div className="min-h-screen bg-[#f7f9fb] text-slate-900">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] flex-col border-r border-slate-200 bg-white md:flex">
      <Link href="/console" className="flex items-center gap-3 px-6 py-6"><img src="/images/logo.png" alt="Sebisa Project Absensi" className="h-16 w-16 object-contain" /><div><strong className="block text-base">Sebisa Project Absensi</strong><span className="text-xs text-slate-500">Console Management System</span></div></Link>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">{links.map(([iconName, label, href]) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${isActive(href) ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}>{icon(iconName)}{label}</Link>)}</nav>
    </aside>
    <header className="fixed right-0 top-0 z-30 hidden h-16 w-[calc(100%-280px)] items-center justify-end border-b border-slate-200 bg-slate-50/80 px-8 backdrop-blur-md md:flex"><div className="flex items-center gap-4"><span aria-hidden="true" className="material-symbols-outlined text-slate-500">notifications</span><div className="h-8 w-px bg-slate-200" /><div className="relative"><button type="button" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen} aria-haspopup="menu" className="flex items-center gap-3"><div className="text-right"><p className="text-sm font-semibold text-slate-900">{currentUser?.name || 'Memuat...'}</p><p className="text-xs uppercase text-slate-500">{currentUser?.role || 'hr'}</p></div><span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-bold text-slate-700">{currentUser?.name?.slice(0, 2).toUpperCase() || '--'}</span>{icon('expand_more', 18)}</button>{profileOpen && <div role="menu" className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-lg"><div className="border-b border-slate-100 px-4 py-3"><p className="text-sm font-semibold">{currentUser?.name}</p><p className="text-xs text-slate-500">{currentUser?.email}</p></div><Link role="menuitem" href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100">{icon('person', 18)}Profil & Password</Link><button type="button" role="menuitem" onClick={logout} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-rose-50 hover:text-rose-600">{icon('logout', 18)}Keluar</button></div>}</div></div></header>
    <main className="min-h-screen pb-24 pt-8 md:ml-[280px] md:pb-8 md:pt-24"><div className="mx-auto max-w-[1440px] px-6 md:px-8">{children}</div></main>
    <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white px-1 py-2 md:hidden">{mobileLinks.map(([iconName, label, href]) => <Link key={href} href={href} className={`flex min-w-0 flex-col items-center gap-1 px-1 py-1 ${isActive(href) ? 'text-emerald-700' : 'text-slate-500'}`}>{icon(iconName, 20)}<span className="truncate text-[10px] font-semibold">{label}</span></Link>)}<div className="relative flex min-w-0 justify-center"><button onClick={() => setSettingsOpen(!settingsOpen)} className={`flex min-w-0 flex-col items-center gap-1 px-1 py-1 ${settingsOpen || isActive('/profile') ? 'text-emerald-700' : 'text-slate-500'}`}>{icon('settings', 20)}<span className="truncate text-[10px] font-semibold">Pengaturan</span></button>{settingsOpen && <div className="absolute bottom-14 right-0 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">{links.slice(4).map(([iconName, label, href]) => <Link key={href} href={href} onClick={() => setSettingsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">{icon(iconName, 18)}{label}</Link>)}<Link href="/profile" onClick={() => setSettingsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">{icon('person', 18)}Profil</Link><button onClick={logout} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-600">{icon('logout', 18)}Keluar</button></div>}</div></nav>
  </div>
}
