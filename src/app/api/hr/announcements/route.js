import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManage, forbidden, safe, unauthorized } from '../_utils'

export async function GET() { const user = await getCurrentUser(); if (!user) return unauthorized(); if (!canManage(user)) return forbidden(); return NextResponse.json(safe({ announcements: await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } }) })) }
export async function POST(request) { const user = await getCurrentUser(); if (!user) return unauthorized(); if (!canManage(user)) return forbidden(); const body = await request.json().catch(() => ({})); if (!body.title || !body.message) return NextResponse.json({ message: 'Judul dan pesan wajib diisi.' }, { status: 422 }); const announcement = await prisma.announcement.create({ data: { title: String(body.title), message: String(body.message), createdBy: user.id } }); return NextResponse.json(safe({ announcement }), { status: 201 }) }