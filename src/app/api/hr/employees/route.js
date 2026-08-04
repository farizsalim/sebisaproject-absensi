import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManage, forbidden, safe, unauthorized } from '../_utils'

export async function GET() {
  const user = await getCurrentUser(); if (!user) return unauthorized(); if (!canManage(user)) return forbidden()
  const employees = await prisma.employee.findMany({ where: { deletedAt: null }, include: { user: { select: { name: true, email: true, role: true } } }, orderBy: { fullName: 'asc' } })
  return NextResponse.json(safe({ employees }))
}

export async function POST(request) {
  const user = await getCurrentUser(); if (!user) return unauthorized(); if (!canManage(user)) return forbidden()
  const body = await request.json().catch(() => ({})); const fullName = String(body.fullName || '').trim(); const email = String(body.email || '').trim().toLowerCase()
  if (!fullName || !email || !body.employeeNumber || !body.division || !body.position || !body.password) return NextResponse.json({ message: 'Data employee dan akun wajib diisi.' }, { status: 422 })
  const existing = await prisma.user.findUnique({ where: { email } }); if (existing) return NextResponse.json({ message: 'Email sudah terdaftar.' }, { status: 422 })
  const { hashPassword } = await import('@/lib/password')
  const employee = await prisma.$transaction(async (tx) => {
    const account = await tx.user.create({ data: { name: fullName, email, password: hashPassword(body.password), role: 'employee' } })
    return tx.employee.create({ data: { userId: account.id, employeeNumber: String(body.employeeNumber), fullName, division: String(body.division), position: String(body.position), batch: body.batch ? String(body.batch) : null, phone: body.phone ? String(body.phone) : null } })
  })
  return NextResponse.json(safe({ message: 'Employee berhasil dibuat.', employee }), { status: 201 })
}