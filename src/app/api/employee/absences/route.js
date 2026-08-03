import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const safe = (value) => JSON.parse(JSON.stringify(value, (_, item) => typeof item === 'bigint' ? item.toString() : item))

async function employeeForUser(userId) {
  return prisma.employee.findUnique({ where: { userId } })
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 })
  const employee = await employeeForUser(user.id)
  if (!employee) return NextResponse.json({ message: 'Profil employee belum tersedia.' }, { status: 404 })

  const requests = await prisma.absenceRequest.findMany({ where: { employeeId: employee.id }, orderBy: { requestDate: 'desc' } })
  return NextResponse.json(safe({ requests }))
}

export async function POST(request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 })
  const employee = await employeeForUser(user.id)
  if (!employee) return NextResponse.json({ message: 'Profil employee belum tersedia.' }, { status: 404 })

  const body = await request.json().catch(() => ({}))
  const requestType = String(body.requestType || body.request_type || '').trim()
  const requestDate = new Date(body.requestDate || body.request_date)
  const reason = String(body.reason || '').trim()
  if (!requestType || Number.isNaN(requestDate.getTime()) || !reason) {
    return NextResponse.json({ message: 'Jenis izin, tanggal, dan alasan wajib diisi.' }, { status: 422 })
  }

  const absence = await prisma.absenceRequest.create({ data: { employeeId: employee.id, requestType, requestDate, reason } })
  return NextResponse.json(safe({ message: 'Pengajuan izin berhasil dibuat.', absence }), { status: 201 })
}