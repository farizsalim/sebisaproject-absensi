import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManage, forbidden, safe, unauthorized } from '../_utils'

export async function GET() { const user = await getCurrentUser(); if (!user) return unauthorized(); if (!canManage(user)) return forbidden(); return NextResponse.json(safe({ holidays: await prisma.publicHoliday.findMany({ orderBy: { holidayDate: 'asc' } }) })) }
export async function POST(request) { const user = await getCurrentUser(); if (!user) return unauthorized(); if (!canManage(user)) return forbidden(); const body = await request.json().catch(() => ({})); const holidayDate = new Date(body.holidayDate); if (!body.name || Number.isNaN(holidayDate.getTime())) return NextResponse.json({ message: 'Nama dan tanggal hari libur wajib diisi.' }, { status: 422 }); const holiday = await prisma.publicHoliday.create({ data: { name: String(body.name), holidayDate, notes: body.notes ? String(body.notes) : null, createdBy: user.id } }); return NextResponse.json(safe({ holiday }), { status: 201 }) }