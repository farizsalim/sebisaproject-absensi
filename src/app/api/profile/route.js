import { NextResponse } from 'next/server'
import { getCurrentUser, serializeUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/password'

function unauthorized() {
  return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 })
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return unauthorized()
  return NextResponse.json({ user: serializeUser(user) })
}

export async function PATCH(request) {
  const user = await getCurrentUser()
  if (!user) return unauthorized()

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Format request tidak valid.' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const errors = {}

  if (!name) errors.name = ['Nama wajib diisi.']
  if (name.length > 255) errors.name = ['Nama maksimal 255 karakter.']
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = ['Email tidak valid.']

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ message: 'Data profil tidak valid.', errors }, { status: 422 })
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name, email },
      select: { id: true, name: true, email: true, role: true },
    })

    return NextResponse.json({ message: 'Profil berhasil diperbarui.', user: serializeUser(updatedUser) })
  } catch (error) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ message: 'Email sudah digunakan.', errors: { email: ['Email sudah digunakan.'] } }, { status: 422 })
    }
    console.error('Profile update error:', error)
    return NextResponse.json({ message: 'Profil gagal diperbarui.' }, { status: 500 })
  }
}

export async function PUT(request) {
  const user = await getCurrentUser()
  if (!user) return unauthorized()
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ message: 'Format request tidak valid.' }, { status: 400 })
  }

  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const passwordConfirmation = typeof body.passwordConfirmation === 'string' ? body.passwordConfirmation : ''

  if (!currentPassword || !verifyPassword(currentPassword, user.password)) {
    return NextResponse.json({ message: 'Password saat ini salah.' }, { status: 422 })
  }
  if (password.length < 8) {
    return NextResponse.json({ message: 'Password baru minimal 8 karakter.' }, { status: 422 })
  }
  if (password !== passwordConfirmation) {
    return NextResponse.json({ message: 'Konfirmasi password tidak sama.' }, { status: 422 })
  }

  try {
    await prisma.user.update({ where: { id: user.id }, data: { password: hashPassword(password) } })
    return NextResponse.json({ message: 'Password berhasil diperbarui.' })
  } catch (error) {
    console.error('Password update error:', error)
    return NextResponse.json({ message: 'Password gagal diperbarui.' }, { status: 500 })
  }
}

export async function DELETE(request) {
  const user = await getCurrentUser()
  if (!user) return unauthorized()
  const body = await request.json().catch(() => ({}))
  if (!verifyPassword(typeof body.password === 'string' ? body.password : '', user.password)) return NextResponse.json({ message: 'Password salah.' }, { status: 422 })
  await prisma.user.delete({ where: { id: user.id } })
  const response = NextResponse.json({ message: 'Akun berhasil dihapus.' })
  response.cookies.set({ name: 'sebisa_session', value: '', expires: new Date(0), path: '/' })
  return response
}
