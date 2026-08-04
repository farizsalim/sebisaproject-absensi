import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManage, forbidden, safe, unauthorized } from '../../_utils'

export async function GET(_, { params }) {
  const user = await getCurrentUser(); if (!user) return unauthorized(); if (!canManage(user)) return forbidden()
  const { id } = await params
  const employee = await prisma.employee.findUnique({ where: { id: BigInt(id) }, include: { user: { select: { name: true, email: true, role: true } }, attendances: { orderBy: { attendanceDate: 'desc' }, take: 20 }, absenceRequests: { orderBy: { createdAt: 'desc' }, take: 10 }, workReports: { orderBy: { reportDate: 'desc' }, take: 10 } } })
  if (!employee) return NextResponse.json({ message: 'Employee tidak ditemukan.' }, { status: 404 }); return NextResponse.json(safe({ employee }))
}

export async function PATCH(request, { params }) {
  const user = await getCurrentUser(); if (!user) return unauthorized(); if (!canManage(user)) return forbidden()
  const { id } = await params
  const body = await request.json().catch(() => ({})); const employee = await prisma.employee.findUnique({ where: { id: BigInt(id) } }); if (!employee) return NextResponse.json({ message: 'Employee tidak ditemukan.' }, { status: 404 })
  const data = {}
  const userData = {}
  ;['fullName', 'employeeNumber', 'division', 'position', 'batch', 'phone', 'notes'].forEach((field) => { if (body[field] !== undefined) data[field] = body[field] || null })
  if (data.fullName) { data.fullName = String(data.fullName); userData.name = data.fullName }
  if (data.position !== undefined) data.position = String(data.position)
  if (body.email !== undefined) {
    const email = String(body.email).trim().toLowerCase()
    if (!email) return NextResponse.json({ message: 'Email wajib diisi.' }, { status: 422 })
    const existing = await prisma.user.findFirst({ where: { email, NOT: { id: employee.userId } } })
    if (existing) return NextResponse.json({ message: 'Email sudah terdaftar.' }, { status: 422 })
    userData.email = email
  }
  if (!Object.keys(data).length && !Object.keys(userData).length) return NextResponse.json({ message: 'Tidak ada perubahan.' }, { status: 422 })
  const updatedEmployee = await prisma.$transaction(async (tx) => {
    if (Object.keys(userData).length) await tx.user.update({ where: { id: employee.userId }, data: userData })
    return tx.employee.update({ where: { id: BigInt(id) }, data })
  })
  return NextResponse.json(safe({ employee: updatedEmployee }))
}

export async function DELETE(_, { params }) {
  const user = await getCurrentUser(); if (!user) return unauthorized(); if (!canManage(user)) return forbidden()
  const { id } = await params
  await prisma.employee.update({ where: { id: BigInt(id) }, data: { deletedAt: new Date() } }); return NextResponse.json({ message: 'Employee dinonaktifkan.' })
}