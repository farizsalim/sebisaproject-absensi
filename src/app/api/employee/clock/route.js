import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { attendanceStatus } from '@/lib/attendance'

function unauthorized() {
  return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 })
}

function today() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function jsonSafe(value) {
  return JSON.parse(JSON.stringify(value, (_, item) => (
    typeof item === 'bigint' ? item.toString() : item
  )))
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return unauthorized()

  const employee = await prisma.employee.findUnique({ where: { userId: user.id } })
  if (!employee) return NextResponse.json({ message: 'Profil employee belum tersedia.' }, { status: 404 })

  const attendance = await prisma.attendance.findUnique({
    where: { employeeId_attendanceDate: { employeeId: employee.id, attendanceDate: today() } },
  })

  return NextResponse.json(jsonSafe({ attendance }))
}

export async function POST(request) {
  const user = await getCurrentUser()
  if (!user) return unauthorized()

  const employee = await prisma.employee.findUnique({ where: { userId: user.id } })
  if (!employee) return NextResponse.json({ message: 'Profil employee belum tersedia.' }, { status: 404 })

  const attendanceDate = today()
  const existing = await prisma.attendance.findUnique({ where: { employeeId_attendanceDate: { employeeId: employee.id, attendanceDate } } })
  const now = new Date()
  const body = await request.json().catch(() => ({}))
  const action = body.action || (existing?.clockInAt && !existing?.clockOutAt ? 'clock_out' : 'clock_in')

  if (action === 'clock_in' && existing?.clockInAt) {
    return NextResponse.json(jsonSafe({ message: 'Anda sudah clock in hari ini.', attendance: existing }), { status: 422 })
  }

  if (action === 'clock_out' && (!existing || !existing.clockInAt)) {
    return NextResponse.json({ message: 'Silakan clock in terlebih dahulu.' }, { status: 422 })
  }

  const attendance = action === 'clock_out'
    ? await prisma.attendance.update({ where: { id: existing.id }, data: { clockOutAt: now, status: attendanceStatus({ clockInAt: existing.clockInAt, clockOutAt: now }) } })
    : await prisma.attendance.upsert({ where: { employeeId_attendanceDate: { employeeId: employee.id, attendanceDate } }, update: { clockInAt: now, status: attendanceStatus({ clockInAt: now, clockOutAt: null }), source: 'web' }, create: { employeeId: employee.id, attendanceDate, clockInAt: now, status: attendanceStatus({ clockInAt: now, clockOutAt: null }), source: 'web', createdBy: user.id } })

  return NextResponse.json(jsonSafe({ message: action === 'clock_out' ? 'Clock out berhasil.' : 'Clock in berhasil.', attendance }))
}