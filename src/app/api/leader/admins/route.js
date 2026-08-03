import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function unauthorized() { return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 }) }
function forbidden() { return NextResponse.json({ message: 'Khusus leader.' }, { status: 403 }) }
function safe(value) { return JSON.parse(JSON.stringify(value, (_, item) => typeof item === 'bigint' ? item.toString() : item)) }

async function leader() {
  const user = await getCurrentUser()
  if (!user) return { response: unauthorized() }
  if (user.role !== 'leader') return { response: forbidden() }
  return { user }
}

export async function GET(request) {
  const auth = await leader()
  if (auth.response) return auth.response
  const params = new URL(request.url).searchParams
  const role = params.get('role')
  const query = params.get('q')?.trim() || ''
  const where = { role: role === 'employee' || role === 'hr' ? role : { in: ['employee', 'hr'] } }
  if (query) {
    where.OR = [
      { name: { contains: query } },
      { email: { contains: query } },
      { employee: { employeeNumber: { contains: query } } },
      { employee: { division: { contains: query } } },
    ]
  }
  const users = await prisma.user.findMany({ where, take: 30, select: { id: true, name: true, email: true, role: true, createdAt: true, employee: { select: { employeeNumber: true, division: true, position: true } } }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(safe({ users }))
}

