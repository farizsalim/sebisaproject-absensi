import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const safe = (value) => JSON.parse(JSON.stringify(value, (_, item) => typeof item === 'bigint' ? item.toString() : item))

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 })
  const employee = await prisma.employee.findUnique({ where: { userId: user.id } })
  if (!employee) return NextResponse.json({ message: 'Profil employee belum tersedia.' }, { status: 404 })
  const reports = await prisma.workReport.findMany({ where: { employeeId: employee.id }, orderBy: { reportDate: 'desc' }, include: { files: true } })
  return NextResponse.json(safe({ reports }))
}

export async function POST(request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 })
  const employee = await prisma.employee.findUnique({ where: { userId: user.id } })
  if (!employee) return NextResponse.json({ message: 'Profil employee belum tersedia.' }, { status: 404 })
  const body = await request.json().catch(() => ({}))
  const reportDate = new Date(body.reportDate || body.report_date)
  const title = String(body.title || '').trim()
  const description = String(body.description || '').trim()
  if (Number.isNaN(reportDate.getTime()) || !title || !description || !body.workStartAt || !body.workEndAt) {
    return NextResponse.json({ message: 'Tanggal, judul, deskripsi, dan jam kerja wajib diisi.' }, { status: 422 })
  }
  const report = await prisma.workReport.create({ data: { employeeId: employee.id, reportDate, title, description, workStartAt: new Date(`1970-01-01T${body.workStartAt}`), workEndAt: new Date(`1970-01-01T${body.workEndAt}`) } })
  return NextResponse.json(safe({ message: 'Laporan kerja berhasil dibuat.', report }), { status: 201 })
}