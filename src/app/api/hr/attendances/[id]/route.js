import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { attendanceStatus } from '@/lib/attendance'
import { canManage, forbidden, safe, unauthorized } from '../../_utils'

export async function GET(request, { params }) {
  const user = await getCurrentUser(); if (!user) return unauthorized(); if (!canManage(user)) return forbidden()
  const { id } = await params
  try {
    const attendance = await prisma.attendance.findUnique({ where: { id: BigInt(id) }, include: { logs: { include: { changedByUser: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' } } } })
    if (!attendance) return NextResponse.json({ message: 'Data presensi tidak ditemukan.' }, { status: 404 })
    return NextResponse.json(safe({ attendance, logs: attendance.logs }))
  } catch {
    return NextResponse.json({ message: 'Riwayat presensi gagal dimuat.' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  const user = await getCurrentUser(); if (!user) return unauthorized(); if (!canManage(user)) return forbidden()
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const attendanceDate = new Date(`${body.attendanceDate}T00:00:00`)
  const clockInAt = body.clockInAt ? new Date(`${body.attendanceDate}T${body.clockInAt}:00`) : null
  const clockOutAt = body.clockOutAt ? new Date(`${body.attendanceDate}T${body.clockOutAt}:00`) : null
  if (Number.isNaN(attendanceDate.getTime()) || (clockInAt && Number.isNaN(clockInAt.getTime())) || (clockOutAt && Number.isNaN(clockOutAt.getTime()))) return NextResponse.json({ message: 'Tanggal atau jam presensi tidak valid.' }, { status: 422 })
  if (clockInAt && clockOutAt && clockOutAt < clockInAt) return NextResponse.json({ message: 'Jam pulang tidak boleh lebih awal dari jam masuk.' }, { status: 422 })
  try {
    const attendance = await prisma.$transaction(async (tx) => {
      const existing = await tx.attendance.findUnique({ where: { id: BigInt(id) } })
      if (!existing) throw new Error('ATTENDANCE_NOT_FOUND')
      const status = attendanceStatus({ clockInAt, clockOutAt })
      const updated = await tx.attendance.update({ where: { id: BigInt(id) }, data: { attendanceDate, clockInAt, clockOutAt, status, source: 'manual' } })
      await tx.attendanceLog.create({ data: { attendanceId: updated.id, changedBy: user.id, fieldChanged: 'manual_update', oldValue: JSON.stringify({ attendanceDate: existing.attendanceDate, clockInAt: existing.clockInAt, clockOutAt: existing.clockOutAt, status: existing.status }), newValue: JSON.stringify({ attendanceDate, clockInAt, clockOutAt, status: updated.status }), reason: String(body.reason || '').trim() || 'Perubahan presensi manual oleh HR' } })
      return updated
    })
    return NextResponse.json(safe({ message: 'Presensi berhasil diperbarui.', attendance }))
  } catch (error) {
    if (error?.message === 'ATTENDANCE_NOT_FOUND') return NextResponse.json({ message: 'Data presensi tidak ditemukan.' }, { status: 404 })
    return NextResponse.json({ message: 'Presensi gagal diperbarui.' }, { status: 500 })
  }
}
