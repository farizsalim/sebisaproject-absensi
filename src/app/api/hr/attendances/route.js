import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { attendanceStatus } from '@/lib/attendance'
import { canManage, forbidden, safe, unauthorized } from '../_utils'

export async function GET(request) {
	const user = await getCurrentUser(); if (!user) return unauthorized(); if (!canManage(user)) return forbidden()
	const { searchParams } = new URL(request.url)
	const date = searchParams.get('date')
	const status = searchParams.get('status')?.trim()
	const query = searchParams.get('q')?.trim()
	const where = {
		...(date ? { attendanceDate: new Date(date) } : {}),
		...(status ? { status } : {}),
		...(query ? { employee: { OR: [{ fullName: { contains: query } }, { employeeNumber: { contains: query } }, { division: { contains: query } }] } } : {}),
	}
	const attendances = await prisma.attendance.findMany({ where, include: { employee: true }, orderBy: [{ attendanceDate: 'desc' }, { employee: { fullName: 'asc' } }], take: 500 })
	const summary = attendances.reduce((result, attendance) => { result[attendance.status] = (result[attendance.status] || 0) + 1; return result }, {})
	return NextResponse.json(safe({ attendances, summary }))
}

export async function POST(request) {
	const user = await getCurrentUser(); if (!user) return unauthorized(); if (!canManage(user)) return forbidden()
	const body = await request.json().catch(() => ({}))
	const employeeId = body.employeeId ? BigInt(body.employeeId) : null
	const attendanceDate = new Date(`${body.attendanceDate}T00:00:00`)
	const clockInAt = body.clockInAt ? new Date(`${body.attendanceDate}T${body.clockInAt}:00`) : null
	const clockOutAt = body.clockOutAt ? new Date(`${body.attendanceDate}T${body.clockOutAt}:00`) : null
	if (!employeeId || Number.isNaN(attendanceDate.getTime()) || (body.clockInAt && Number.isNaN(clockInAt.getTime())) || (body.clockOutAt && Number.isNaN(clockOutAt.getTime()))) return NextResponse.json({ message: 'Employee, tanggal, dan jam presensi harus valid.' }, { status: 422 })
	if (clockInAt && clockOutAt && clockOutAt < clockInAt) return NextResponse.json({ message: 'Jam pulang tidak boleh lebih awal dari jam masuk.' }, { status: 422 })
	try {
		const attendance = await prisma.$transaction(async (tx) => {
			const employee = await tx.employee.findUnique({ where: { id: employeeId, deletedAt: null } })
			if (!employee) throw new Error('EMPLOYEE_NOT_FOUND')
			const existing = await tx.attendance.findUnique({ where: { employeeId_attendanceDate: { employeeId, attendanceDate } } })
			const status = attendanceStatus({ clockInAt, clockOutAt })
			const result = await tx.attendance.upsert({ where: { employeeId_attendanceDate: { employeeId, attendanceDate } }, update: { clockInAt, clockOutAt, status, source: 'manual', createdBy: user.id }, create: { employeeId, attendanceDate, clockInAt, clockOutAt, status, source: 'manual', createdBy: user.id } })
			await tx.attendanceLog.create({ data: { attendanceId: result.id, changedBy: user.id, fieldChanged: existing ? 'manual_update' : 'manual_create', oldValue: existing ? JSON.stringify({ clockInAt: existing.clockInAt, clockOutAt: existing.clockOutAt, status: existing.status }) : null, newValue: JSON.stringify({ clockInAt, clockOutAt, status: result.status }), reason: body.reason ? String(body.reason) : 'Presensi manual oleh HR' } })
			return result
		})
		return NextResponse.json(safe({ message: 'Presensi manual berhasil disimpan.', attendance }), { status: 201 })
	} catch (error) {
		if (error?.message === 'EMPLOYEE_NOT_FOUND') return NextResponse.json({ message: 'Employee tidak ditemukan atau sudah nonaktif.' }, { status: 404 })
		return NextResponse.json({ message: 'Presensi manual gagal disimpan.' }, { status: 500 })
	}
}