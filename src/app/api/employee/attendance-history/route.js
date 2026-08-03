import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { dateOnlyRange } from '@/lib/date'

const safe = (value) => JSON.parse(JSON.stringify(value, (_, item) => typeof item === 'bigint' ? item.toString() : item))

export async function GET(request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 })

  const employee = await prisma.employee.findUnique({ where: { userId: user.id } })
  if (!employee) return NextResponse.json({ message: 'Profil employee belum tersedia.' }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const now = new Date()
  const currentDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  const [currentYear, currentMonth] = currentDate.split('-').map(Number)
  const month = Number(searchParams.get('month') || currentMonth)
  const year = Number(searchParams.get('year') || currentYear)
  const { start, end } = dateOnlyRange(year, month)
  const attendances = await prisma.attendance.findMany({
    where: { employeeId: employee.id, attendanceDate: { gte: start, lte: end } },
    orderBy: { attendanceDate: 'desc' },
  })

  return NextResponse.json(safe({ attendances, month, year }))
}