'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import EmployeeShell from '@/components/employee/EmployeeShell'

const menuGroups = [
  {
    label: 'Aktivitas',
    items: [
      ['schedule', 'Presensi', '/employee/clock'],
      ['photo_camera', 'Pendaftaran Wajah', '/employee/face-registration'],
      ['history', 'Riwayat', '/employee/attendance-history'],
      ['event_note', 'Pengajuan Izin', '/employee/absences'],
      ['edit_note', 'Laporan Kerja', '/employee/work-reports'],
    ],
  },
]

function Icon({ children, size = 20 }) {
  return <span className="material-symbols-outlined" style={{ fontSize: size }}>{children}</span>
}

function Sidebar({ onLogout }) {
  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[280px] flex-col border-r border-slate-200 bg-white shadow-sm md:flex">
      <Link href="/dashboard" className="mb-2 flex items-center gap-3 px-6 py-6">
        <img src="/images/logo.png" alt="Sebisa Presensi" className="h-20 w-20 shrink-0 object-contain" />
        <div>
          <h1 className="text-base font-bold leading-tight text-slate-900">Sebisa Presensi</h1>
          <p className="text-xs font-medium text-slate-500">Employee Portal</p>
        </div>
      </Link>
      <div className="mx-4 mb-4 border-t border-slate-200" />
      <nav className="custom-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto px-3" aria-label="Main navigation">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-lg bg-emerald-100 px-3 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-200">
          <Icon>dashboard</Icon>Dashboard
        </Link>
        {menuGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1 mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{group.label}</p>
            {group.items.map(([icon, label, href]) => (
              <Link key={label} href={href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                <Icon>{icon}</Icon>{label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="mt-auto border-t border-slate-200 px-3 py-4">
        <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600">
          <Icon>logout</Icon>Keluar
        </button>
      </div>
    </aside>
  )
}

function Topbar({ notificationOpen, setNotificationOpen, profileOpen, setProfileOpen, user, unreadCount }) {
  return (
    <header className="fixed right-0 top-0 z-40 hidden h-16 w-[calc(100%-280px)] items-center justify-between border-b border-slate-200 bg-slate-50/80 px-8 backdrop-blur-md md:flex">
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <div className="relative">
          <button onClick={() => setNotificationOpen(!notificationOpen)} aria-label="Notifikasi" className="relative p-1 text-slate-500 transition hover:text-slate-900">
            <Icon size={22}>notifications</Icon>
            {unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">{unreadCount}</span>}
          </button>
          {notificationOpen && <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3"><h3 className="text-sm font-semibold text-slate-900">Notifikasi</h3><button className="text-xs font-semibold text-emerald-600">Tandai dibaca</button></div>
            <div className="px-4 py-4 text-sm text-slate-500">Buka halaman notifikasi untuk melihat semua pesan.</div>
            <div className="border-t border-slate-200 px-4 py-2.5 text-center"><Link href="/notifications" className="text-xs font-semibold text-emerald-600">Lihat Semua Notifikasi</Link></div>
          </div>}
        </div>
        <div className="h-8 w-px bg-slate-200" />
        <div className="relative">
          <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-3">
            <div className="hidden text-right lg:block"><p className="text-sm font-semibold text-slate-900">{user?.name || 'Memuat...'}</p><p className="text-xs capitalize text-slate-500">{user?.role || ''}</p></div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-bold text-slate-700">{user?.name?.slice(0, 2).toUpperCase() || '--'}</span><Icon size={18}>expand_more</Icon>
          </button>
          {profileOpen && <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white py-2 shadow-lg"><div className="border-b border-slate-100 px-4 py-3"><p className="text-sm font-semibold text-slate-900">{user?.name}</p><p className="text-xs text-slate-500">{user?.email}</p><span className="mt-2 inline-flex rounded-md bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-emerald-800">{user?.role}</span></div><Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100"><Icon size={18}>person</Icon>Profil & Password</Link></div>}
        </div>
      </div>
    </header>
  )
}

function ClockCard({ type, time, active, onAction }) {
  const isIn = type === 'in'
  return <div className={`${isIn ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-900'} group relative flex h-48 flex-col justify-between overflow-hidden rounded-xl p-6 shadow-sm`}>
    {isIn && <><div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-transparent" /><div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white/5 blur-2xl" /></>}
    <div className="relative z-10 flex items-start justify-between"><div><p className={`${isIn ? 'text-white/70' : 'text-slate-500'} mb-1 text-sm font-medium uppercase tracking-wider`}>{isIn ? 'Clock In' : 'Clock Out'}</p><h3 className={`text-3xl font-bold leading-none ${time ? (isIn ? 'text-white' : 'text-slate-900') : (isIn ? 'text-white/30' : 'text-slate-300')}`}>{time || '--:--'} <span className={`text-lg ${isIn ? 'text-white/70' : 'text-slate-500'}`}>WIB</span></h3></div><div className={`flex h-10 w-10 items-center justify-center rounded-full ${isIn ? 'border border-emerald-500/30 bg-emerald-500/20 text-emerald-400' : time ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}><Icon>{isIn ? 'login' : 'logout'}</Icon></div></div>
    {active ? <button onClick={onAction} className={`relative z-10 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${isIn ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}><Icon size={18}>photo_camera</Icon>{isIn ? 'Buka Presensi Sekarang' : 'Buka Presensi Pulang'}</button> : <div className="relative z-10 flex items-center gap-2 text-sm font-medium text-slate-500"><Icon size={18}>{time ? 'check_circle' : 'hourglass_empty'}</Icon>{time ? (isIn ? 'Tepat Waktu' : 'Selesai hari ini') : 'Menunggu clock in'}</div>}
  </div>
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [clock, setClock] = useState(null)
  const today = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' }).format(new Date())

  useEffect(() => {
    fetch('/api/auth/me').then((response) => response.json()).then((auth) => {
      if (['hr', 'leader'].includes(auth.user?.role?.toLowerCase())) return window.location.replace('/console')
      return Promise.all([fetch('/api/dashboard').then((response) => response.json()), fetch('/api/employee/clock').then((response) => response.json())]).then(([dashboard, attendance]) => { setData(dashboard); setClock(attendance.attendance) })
    })
  }, [])
  const actionClock = async (action) => { const response = await fetch('/api/employee/clock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) }); const result = await response.json(); if (response.ok) setClock(result.attendance) }
  const clockIn = clock?.clockInAt ? new Date(clock.clockInAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''
  const clockOut = clock?.clockOutAt ? new Date(clock.clockOutAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''
  const activities = [
    ...(data?.latestAbsences || []).map((item) => ({ title: 'Pengajuan Izin', date: new Date(item.requestDate).toLocaleDateString('id-ID'), status: item.status, tone: 'amber', icon: 'event_note' })),
    ...(data?.latestReports || []).map((item) => ({ title: item.title, date: new Date(item.reportDate).toLocaleDateString('id-ID'), tone: 'slate', icon: 'edit_note' })),
  ].slice(0, 4)

  return <EmployeeShell>
        <section className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><h2 className="text-xl font-semibold text-slate-950 md:text-2xl">Halo, {data?.user?.name || '...' }!</h2><p className="text-base capitalize text-slate-500">{data?.employee ? `${data.employee.division} / ${data.employee.position}${data.employee.batch ? ` / Batch ${data.employee.batch}` : ''}` : 'Memuat profil...'}</p></div><div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm"><Icon size={20}>calendar_today</Icon>{today}</div></section>
        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2"><ClockCard type="in" time={clockIn} active={!clockIn} onAction={() => actionClock('clock_in')} /><ClockCard type="out" time={clockOut} active={Boolean(clockIn) && !clockOut} onAction={() => actionClock('clock_out')} /></section>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="mb-4 text-lg font-semibold text-slate-950">Statistik Bulan Ini</h3><div className="grid grid-cols-2 gap-4 sm:grid-cols-4"><Stat label="Hadir" value={data?.monthlyStatus?.present || 0} /><Stat label="Terlambat" value={data?.monthlyStatus?.late || 0} tone="amber" /><Stat label="Izin/Sakit" value={(data?.monthlyStatus?.permission || 0) + (data?.monthlyStatus?.sick || 0)} tone="sky" /><Stat label="Alpha" value={data?.monthlyStatus?.absent || 0} tone="red" /></div></section>
            <section><h3 className="mb-4 text-lg font-semibold text-slate-950">Aksi Cepat</h3><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[['photo_camera', 'Presensi', '/employee/clock'], ['face_retouching_natural', 'Daftar Wajah', '/employee/face-registration'], ['edit_document', 'Report Harian', '/employee/work-reports/create'], ['event_note', 'Ajukan Izin', '/employee/absences/create']].map(([icon, label, href]) => <Link key={label} href={href} className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-500 hover:bg-emerald-50"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition group-hover:bg-white group-hover:text-emerald-600"><Icon>{icon}</Icon></span><span className="text-sm font-medium text-slate-900">{label}</span></Link>)}</div></section>
          </div>
          <section className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-6 flex items-center justify-between"><h3 className="text-lg font-semibold text-slate-950">Aktivitas Terakhir</h3><Link href="/employee/attendance-history" className="text-sm font-medium text-sky-500 hover:underline">Lihat Semua</Link></div><div className="relative flex-1"><div className="absolute bottom-2 left-4 top-2 w-px bg-slate-200" /><div className="space-y-6">{activities.map((item) => <div key={item.title} className="relative flex gap-4"><div className={`absolute left-4 top-1 h-2 w-2 -translate-x-1/2 rounded-full ring-4 ring-white ${item.tone === 'amber' ? 'bg-amber-500' : 'bg-slate-400'}`} /><div className="ml-8 flex-1"><p className="text-sm font-medium text-slate-950">{item.title}</p><p className="mt-0.5 text-xs text-slate-500">{item.date}</p>{item.status && <span className="mt-2 inline-flex items-center gap-1.5 rounded bg-amber-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700"><Icon size={12}>{item.icon}</Icon>{item.status}</span>}{item.detail && <p className="mt-1 text-xs text-slate-600">{item.detail}</p>}</div></div>)}</div></div></section>
        </div>
        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2"><InfoList title="Hari Libur Mendatang" icon="event" iconTone="emerald" items={(data?.upcomingHolidays || []).map((item) => ({ name: item.name, date: new Date(item.holidayDate).toLocaleDateString('id-ID') }))} /><InfoList title="Pengumuman" icon="campaign" iconTone="violet" items={(data?.recentAnnouncements || []).map((item) => ({ title: item.title, message: item.message, time: new Date(item.createdAt).toLocaleDateString('id-ID') }))} /></section>
  </EmployeeShell>
}

function Stat({ label, value, tone = 'slate' }) {
  const styles = { slate: 'bg-slate-50 border-slate-100 text-slate-950', amber: 'bg-amber-50 border-amber-100 text-amber-600', sky: 'bg-sky-50 border-sky-100 text-sky-600', red: 'bg-red-50 border-red-100 text-red-600' }
  return <div className={`rounded-lg border p-4 ${styles[tone]}`}><p className="mb-1 text-xs font-medium text-slate-500">{label}</p><p className="text-2xl font-bold">{value}</p></div>
}

function InfoList({ title, icon, iconTone, items }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="mb-4 text-lg font-semibold text-slate-950">{title}</h3><div className="space-y-3">{items.map((item) => <div key={item.name || item.title} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 transition hover:bg-slate-50"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconTone === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-violet-50 text-violet-600'}`}><Icon size={20}>{icon}</Icon></div><div className="min-w-0"><p className="text-sm font-semibold text-slate-900">{item.name || item.title}</p><p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{item.date ? `${item.date} (${item.relative})` : item.message}</p>{item.time && <p className="mt-1 text-[11px] text-slate-500">{item.time}</p>}</div></div>)}</div></div>
}