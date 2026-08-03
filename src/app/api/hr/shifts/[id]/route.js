import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManage, forbidden, safe, unauthorized } from '../../_utils'
import { dateOnly } from '@/lib/date'

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/
const datePattern = /^\d{4}-\d{2}-\d{2}$/

function parseTime(value) {
  return new Date(`1970-01-01T${value}:00.000Z`)
}

function parseShift(body) {
  const employeeId = body.employeeId ? BigInt(body.employeeId) : null
  const name = String(body.name || '').trim()
  const clockInDeadline = String(body.clockInDeadline || '').trim()
  const clockOutDeadline = String(body.clockOutDeadline || '').trim()
  const effectiveFrom = String(body.effectiveFrom || '').trim()
  const effectiveTo = String(body.effectiveTo || '').trim()
  const workDays = Array.isArray(body.workDays) ? body.workDays.map(Number).filter((day) => Number.isInteger(day) && day >= 1 && day <= 7).sort((a, b) => a - b) : []
  if (!employeeId || !name || !timePattern.test(clockInDeadline) || !timePattern.test(clockOutDeadline) || !datePattern.test(effectiveFrom) || (effectiveTo && !datePattern.test(effectiveTo)) || workDays.length === 0) throw new Error('INVALID_SHIFT')
  const from = dateOnly(effectiveFrom)
  const to = effectiveTo ? dateOnly(effectiveTo) : null
  if (to && to < from) throw new Error('INVALID_PERIOD')
  if (parseTime(clockOutDeadline) <= parseTime(clockInDeadline)) throw new Error('INVALID_TIME_RANGE')
  return { employeeId, name, clockInDeadline: parseTime(clockInDeadline), clockOutDeadline: parseTime(clockOutDeadline), effectiveFrom: from, effectiveTo: to, workDays: workDays.join(','), isActive: body.isActive !== false }
}

function validationError(error) {
  const messages = { INVALID_SHIFT: 'Employee, nama, jam, periode, dan hari kerja wajib valid.', INVALID_PERIOD: 'Tanggal akhir tidak boleh lebih awal dari tanggal mulai.', INVALID_TIME_RANGE: 'Jam pulang harus lebih akhir dari batas clock in.' }
  return NextResponse.json({ message: messages[error.message] || 'Data shift tidak valid.' }, { status: 422 })
}

export async function PATCH(request, { params }) {
  const user = await getCurrentUser(); if (!user) return unauthorized(); if (!canManage(user)) return forbidden()
  const { id } = await params
  try {
    const data = parseShift(await request.json().catch(() => ({})))
    const employee = await prisma.employee.findUnique({ where: { id: data.employeeId, deletedAt: null } })
    if (!employee) return NextResponse.json({ message: 'Employee tidak ditemukan atau sudah nonaktif.' }, { status: 404 })
    const shift = await prisma.shift.update({ where: { id: BigInt(id) }, data })
    return NextResponse.json(safe({ message: 'Shift berhasil diperbarui.', shift }))
  } catch (error) {
    if (['INVALID_SHIFT', 'INVALID_PERIOD', 'INVALID_TIME_RANGE'].includes(error.message)) return validationError(error)
    if (error?.code === 'P2025') return NextResponse.json({ message: 'Shift tidak ditemukan.' }, { status: 404 })
    return NextResponse.json({ message: 'Shift gagal diperbarui.' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser(); if (!user) return unauthorized(); if (!canManage(user)) return forbidden()
  const { id } = await params
  try {
    await prisma.shift.delete({ where: { id: BigInt(id) } })
    return NextResponse.json({ message: 'Shift berhasil dihapus.' })
  } catch (error) {
    if (error?.code === 'P2025') return NextResponse.json({ message: 'Shift tidak ditemukan.' }, { status: 404 })
    return NextResponse.json({ message: 'Shift gagal dihapus.' }, { status: 500 })
  }
}
