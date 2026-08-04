import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManage, forbidden, safe, unauthorized } from '../../_utils'

export async function PATCH(request, { params }) { const user = await getCurrentUser(); if (!user) return unauthorized(); if (!canManage(user)) return forbidden(); const body = await request.json().catch(() => ({})); const status = body.status === 'approved' ? 'approved' : body.status === 'rejected' ? 'rejected' : null; if (!status) return NextResponse.json({ message: 'Status harus approved atau rejected.' }, { status: 422 }); const absence = await prisma.absenceRequest.update({ where: { id: BigInt(params.id) }, data: { status, reviewedBy: user.id, reviewedAt: new Date(), hrNote: body.hrNote ? String(body.hrNote) : null } }); return NextResponse.json(safe({ absence })) }