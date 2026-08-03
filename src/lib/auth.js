import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const SESSION_COOKIE = 'sebisa_session'

function sessionSecret() {
  return process.env.SESSION_SECRET || 'sebisa-development-session-secret'
}

function validSignature(payload, signature) {
  const expected = createHmac('sha256', sessionSecret()).update(payload).digest('hex')
  const actualBuffer = Buffer.from(signature || '')
  const expectedBuffer = Buffer.from(expected)

  return actualBuffer.length === expectedBuffer.length
    && timingSafeEqual(actualBuffer, expectedBuffer)
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const value = cookieStore.get(SESSION_COOKIE)?.value
  const [userId, expiresAt, signature] = value?.split('.') || []

  if (!userId || !expiresAt || !signature || Number(expiresAt) < Date.now()) return null

  const payload = `${userId}.${expiresAt}`
  if (!validSignature(payload, signature)) return null

  // Ignore cookies issued by the previous string-ID schema.
  if (!/^\d+$/.test(userId)) return null

  return prisma.user.findUnique({
    where: { id: BigInt(userId) },
    select: { id: true, name: true, email: true, password: true, role: true },
  })
}

export function serializeUser(user) {
  if (!user) return null
  const { password, ...safeUser } = user
  return { ...safeUser, id: user.id.toString() }
}