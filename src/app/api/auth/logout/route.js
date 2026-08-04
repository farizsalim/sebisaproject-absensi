import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ message: 'Logout berhasil.' })
  response.cookies.set({
    name: 'sebisa_session',
    value: '',
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  })
  return response
}
