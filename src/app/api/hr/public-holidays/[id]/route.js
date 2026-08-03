import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManage, forbidden, safe, unauthorized } from '../../_utils'

export async function PATCH(request, { params }) {
  const user = await getCurrentUser()
  if (!user) return unauthorized()
  if (!canManage(user)) return forbidden()

  const body = await request.json().catch(() => ({}))
  const name = String(body.name || '').trim()
  const holidayDate = new Date(body.holidayDate)
  if (!name || Number.isNaN(holidayDate.getTime())) {
    return NextResponse.json({ message: 'Nama dan tanggal hari libur wajib diisi.' }, { status: 422 })
  }

  try {
    const holiday = await prisma.publicHoliday.update({
      where: { id: BigInt(params.id) },
      data: { name, holidayDate, notes: body.notes ? String(body.notes).trim() : null },
    })
    return NextResponse.json(safe({ message: 'Hari libur berhasil diperbarui.', holiday }))
  } catch (error) {
    if (error?.code === 'P2002') return NextResponse.json({ message: 'Tanggal hari libur sudah terdaftar.' }, { status: 422 })
    return NextResponse.json({ message: 'Hari libur tidak ditemukan.' }, { status: 404 })
  }
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser()
  if (!user) return unauthorized()
  if (!canManage(user)) return forbidden()

  try {
    await prisma.publicHoliday.delete({ where: { id: BigInt(params.id) } })
    return NextResponse.json({ message: 'Hari libur berhasil dihapus.' })
  } catch {
    return NextResponse.json({ message: 'Hari libur tidak ditemukan.' }, { status: 404 })
  }
}
