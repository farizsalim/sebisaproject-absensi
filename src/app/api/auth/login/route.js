import { createHmac } from 'node:crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/password'

const SESSION_COOKIE = 'sebisa_session'

function getSessionSecret() {
  return process.env.SESSION_SECRET || 'sebisa-development-session-secret'
}

function signSession(userId, expiresAt) {
  const payload = `${userId}.${expiresAt}`
  const signature = createHmac('sha256', getSessionSecret()).update(payload).digest('hex')
  return `${payload}.${signature}`
}

function validationResponse(errors) {
  return NextResponse.json(
    { message: 'Data login tidak valid.', errors },
    { status: 422 },
  )
}

export async function POST(request) {
  let body

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Format request tidak valid.' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const errors = {}

  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = ['Email tidak valid.']
  if (!password) errors.password = ['Password wajib diisi.']

  if (Object.keys(errors).length > 0) return validationResponse(errors)

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json(
        { message: 'Email atau password salah.' },
        { status: 401 },
      )
    }

    const rememberMe = body.rememberMe === true
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24
    const expiresAt = Date.now() + maxAge * 1000
    const response = NextResponse.json({
      message: 'Login berhasil.',
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    response.cookies.set({
      name: SESSION_COOKIE,
      value: signSession(user.id, expiresAt),
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge,
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Login gagal. Periksa konfigurasi database.' },
      { status: 500 },
    )
  }
}