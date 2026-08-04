import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_, { params }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 })
  const employee = await prisma.employee.findUnique({ where: { userId: user.id } })
  if (!employee) return NextResponse.json({ message: 'Profil employee belum tersedia.' }, { status: 404 })
  const absence = await prisma.absenceRequest.findFirst({ where: { id: BigInt(params.id), employeeId: employee.id } })
  if (!absence) return NextResponse.json({ message: 'Pengajuan izin tidak ditemukan.' }, { status: 404 })
  return NextResponse.json(JSON.parse(JSON.stringify({ absence }, (_, item) => typeof item === 'bigint' ? item.toString() : item)))
}