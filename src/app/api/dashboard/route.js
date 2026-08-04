import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { dateKeyInAppTimeZone, dateOnly, dateOnlyRange } from '@/lib/date'

function unauthorized() {
  return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 })
}

function dateKey(date) {
  return date.toISOString().slice(0, 10)
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
  if (!employee) {
    return NextResponse.json({ mode: 'hr', user: { ...user, id: user.id.toString() } })
  }

  const now = new Date()
  const todayKey = dateKeyInAppTimeZone(now)
  const today = dateOnly(todayKey)
  const [year, month] = todayKey.split('-').map(Number)
  const { start: startOfMonth, end: endOfMonth } = dateOnlyRange(year, month)
  const [todayAttendance, monthlyAttendance, latestAbsences, latestReports, upcomingHolidays, recentAnnouncements] = await Promise.all([
    prisma.attendance.findUnique({ where: { employeeId_attendanceDate: { employeeId: employee.id, attendanceDate: today } } }),
    prisma.attendance.findMany({ where: { employeeId: employee.id, attendanceDate: { gte: startOfMonth, lte: endOfMonth } }, orderBy: { attendanceDate: 'desc' } }),
    prisma.absenceRequest.findMany({ where: { employeeId: employee.id }, orderBy: { createdAt: 'desc' }, take: 4 }),
    prisma.workReport.findMany({ where: { employeeId: employee.id }, orderBy: { reportDate: 'desc' }, take: 4 }),
    prisma.publicHoliday.findMany({ where: { holidayDate: { gte: today } }, orderBy: { holidayDate: 'asc' }, take: 5 }),
    prisma.announcement.findMany({ orderBy: { createdAt: 'desc' }, take: 3 }),
  ])

  const monthlyStatus = monthlyAttendance.reduce((result, attendance) => {
    result[attendance.status] = (result[attendance.status] || 0) + 1
    return result
  }, {})

  return NextResponse.json(jsonSafe({
    mode: 'employee',
    user: { ...user, id: user.id.toString() },
    employee: { ...employee, id: employee.id.toString(), userId: employee.userId.toString() },
    todayAttendance,
    monthlyStatus,
    latestAbsences,
    latestReports,
    upcomingHolidays,
    recentAnnouncements,
    generatedAt: dateKey(now),
  }))
}
