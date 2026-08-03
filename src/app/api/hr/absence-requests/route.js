import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManage, forbidden, safe, unauthorized } from '../_utils'

export async function GET() { const user = await getCurrentUser(); if (!user) return unauthorized(); if (!canManage(user)) return forbidden(); const requests = await prisma.absenceRequest.findMany({ include: { employee: true }, orderBy: { createdAt: 'desc' } }); return NextResponse.json(safe({ requests })) }