import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'

function validationResponse(errors) {
  return NextResponse.json(
    {
      message: 'Data registrasi tidak valid.',
      errors,
    },
    { status: 422 },
  )
}

export async function POST(request) {
  let body

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { message: 'Format request tidak valid.' },
      { status: 400 },
    )
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const passwordConfirmation = typeof body.password_confirmation === 'string'
    ? body.password_confirmation
    : ''

  const errors = {}

  if (!name) errors.name = ['Nama wajib diisi.']
  if (name.length > 255) errors.name = ['Nama maksimal 255 karakter.']
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = ['Email tidak valid.']
  if (!password) errors.password = ['Password wajib diisi.']
  if (password.length < 8) errors.password = ['Password minimal 8 karakter.']
  if (password !== passwordConfirmation) {
    errors.password_confirmation = ['Konfirmasi password tidak cocok.']
  }

  if (Object.keys(errors).length > 0) {
    return validationResponse(errors)
  }

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword(password),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    return NextResponse.json(
      {
        message: 'Registrasi berhasil.',
        user,
      },
      { status: 201 },
    )
  } catch (error) {
    if (error?.code === 'P2002') {
      return validationResponse({
        email: ['Email sudah terdaftar.'],
      })
    }

    console.error('Registration error:', error)

    return NextResponse.json(
      { message: 'Registrasi gagal. Periksa konfigurasi database.' },
      { status: 500 },
    )
  }
}
