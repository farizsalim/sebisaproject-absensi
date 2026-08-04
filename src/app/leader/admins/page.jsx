'use client'

import { useEffect, useState } from 'react'
import RoleShell from '@/components/role/RoleShell'

function AccountCard({ account, onRemove }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-semibold text-slate-950">{account.name}</h3><p className="mt-1 break-words text-sm text-slate-500">{account.email}</p></div><span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold uppercase text-emerald-700">HR</span></div><div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-sm"><div><p className="text-xs text-slate-500">Nomor Employee</p><p className="mt-1 font-medium text-slate-800">{account.employee?.employeeNumber || '-'}</p></div><div><p className="text-xs text-slate-500">Divisi</p><p className="mt-1 font-medium text-slate-800">{account.employee?.division || '-'}</p></div></div><button onClick={() => onRemove(account)} className="mt-4 w-full rounded-lg bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100">Kembalikan ke Employee</button></article>
}

export default function AdminsPage() {
  const [hrAccounts, setHrAccounts] = useState([])
  const [results, setResults] = useState([])
  const [user, setUser] = useState(null)
  const [query, setQuery] = useState('')
  const [searchedQuery, setSearchedQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadHrAccounts = () => fetch('/api/leader/admins?role=hr').then(async (response) => {
    const data = await response.json()
    if (!response.ok) throw new Error(data.message)
    setHrAccounts(data.users || [])
  }).catch((requestError) => setError(requestError.message))

  useEffect(() => {
    fetch('/api/auth/me').then((response) => response.json()).then((data) => setUser(data.user))
    loadHrAccounts()
  }, [])

  useEffect(() => {
    if (!isModalOpen) return
    const search = query.trim()
    if (search.length < 2) return
    const timer = setTimeout(() => {
      fetch(`/api/leader/admins?role=employee&q=${encodeURIComponent(search)}`).then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.message)
        setResults(data.users || [])
        setSearchedQuery(search)
      }).catch((requestError) => setError(requestError.message))
    }, 300)
    return () => clearTimeout(timer)
  }, [isModalOpen, query])

  const search = query.trim()
  const isSearching = search.length >= 2 && searchedQuery !== search

  const changeRole = async (account, role) => {
    setError('')
    setMessage('')
    const response = await fetch(`/api/leader/admins/${account.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) })
    const data = await response.json()
    if (!response.ok) return setError(data.message)
    if (role === 'hr') {
      setHrAccounts((items) => [data.user, ...items])
      setResults((items) => items.filter((item) => item.id !== account.id))
      setMessage(`${account.name} berhasil ditambahkan sebagai HR.`)
      setQuery('')
      setIsModalOpen(false)
    } else {
      setHrAccounts((items) => items.filter((item) => item.id !== account.id))
      setMessage(`${account.name} dikembalikan menjadi employee.`)
    }
  }

  return <RoleShell user={user} leader><header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-bold text-slate-950">Manajemen HR</h1><p className="mt-1 text-sm text-slate-500">Kelola user yang memiliki akses HR.</p></div><button onClick={() => { setError(''); setQuery(''); setIsModalOpen(true) }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"><span className="material-symbols-outlined text-[20px]">person_add</span>Tambah HR</button></header>{message && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}{error && !isModalOpen && <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}<section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="font-semibold text-slate-950">Akun HR saat ini</h2><p className="mt-1 text-sm text-slate-500">{hrAccounts.length} akun terdaftar</p></div></div>{hrAccounts.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{hrAccounts.map((account) => <AccountCard key={account.id} account={account} onRemove={(item) => changeRole(item, 'employee')} />)}</div> : <p className="py-10 text-center text-sm text-slate-500">Belum ada akun HR.</p>}</section>{isModalOpen && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4"><div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-2xl sm:rounded-2xl"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-950">Tambah HR</h2><p className="mt-1 text-sm text-slate-500">Cari user employee yang sudah terdaftar.</p></div><button onClick={() => setIsModalOpen(false)} className="material-symbols-outlined rounded-lg p-1 text-slate-500 hover:bg-slate-100" aria-label="Tutup">close</button></div><div className="mt-5 flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5"><span className="material-symbols-outlined text-slate-400">search</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, email, nomor employee, atau divisi" className="min-w-0 flex-1 text-sm outline-none" /></div>{error && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}{query.trim().length < 2 && <p className="mt-5 text-center text-sm text-slate-500">Ketik minimal 2 karakter untuk mencari user.</p>}{isSearching && <p className="mt-5 text-center text-sm text-slate-500">Mencari user...</p>}{!isSearching && query.trim().length >= 2 && results.length === 0 && <p className="mt-5 text-center text-sm text-slate-500">User employee tidak ditemukan.</p>}<div className="mt-4 space-y-3">{results.map((account) => <article key={account.id} className="rounded-lg border border-slate-200 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><h3 className="font-semibold text-slate-950">{account.name}</h3><p className="mt-1 break-words text-sm text-slate-500">{account.email}</p><p className="mt-2 text-xs text-slate-500">{account.employee?.employeeNumber || '-'} · {account.employee?.division || '-'}</p></div><button onClick={() => changeRole(account, 'hr')} className="w-full shrink-0 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 sm:w-auto">Jadikan HR</button></div></article>)}</div></div></div>}</RoleShell>
}
