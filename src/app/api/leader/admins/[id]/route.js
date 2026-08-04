import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function unauthorized() { return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 }) }
function forbidden() { return NextResponse.json({ message: 'Khusus leader.' }, { status: 403 }) }

async function leader() {
  const user = await getCurrentUser()
  if (!user) return { response: unauthorized() }
  if (user.role !== 'leader') return { response: forbidden() }
  return { user }
}

export async function PATCH(request, { params }) {
  const auth = await leader()
  if (auth.response) return auth.response
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  if (!['employee', 'hr'].includes(body.role)) return NextResponse.json({ message: 'Role hanya dapat diubah menjadi employee atau hr.' }, { status: 422 })
  try {
    const user = await prisma.user.update({ where: { id: BigInt(id), role: { in: ['employee', 'hr'] } }, data: { role: body.role }, select: { id: true, name: true, email: true, role: true, createdAt: true, employee: { select: { employeeNumber: true, division: true, position: true } } } })
    return NextResponse.json({ user: { ...user, id: user.id.toString() } })
  } catch (error) {
    if (error?.code === 'P2002') return NextResponse.json({ message: 'Email sudah digunakan.' }, { status: 422 })
    return NextResponse.json({ message: 'Akun gagal diperbarui.' }, { status: 500 })
  }
}

export async function DELETE(_, { params }) {
  const auth = await leader()
  if (auth.response) return auth.response
  const { id: rawId } = await params
  const id = BigInt(rawId)
  await prisma.user.update({ where: { id, role: 'hr' }, data: { role: 'employee' } })
  return NextResponse.json({ message: 'Role user dikembalikan menjadi employee.' })
}
