import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const safe = (value) => JSON.parse(JSON.stringify(value, (_, item) => typeof item === 'bigint' ? item.toString() : item))

export async function GET(request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 })

  const employee = await prisma.employee.findUnique({ where: { userId: user.id } })
  if (!employee) return NextResponse.json({ message: 'Profil employee belum tersedia.' }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const month = Number(searchParams.get('month') || new Date().getMonth() + 1)
  const year = Number(searchParams.get('year') || new Date().getFullYear())
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0)
  const attendances = await prisma.attendance.findMany({
    where: { employeeId: employee.id, attendanceDate: { gte: start, lte: end } },
    orderBy: { attendanceDate: 'desc' },
  })

  return NextResponse.json(safe({ attendances, month, year }))
}