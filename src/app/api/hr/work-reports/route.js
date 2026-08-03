import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManage, forbidden, safe, unauthorized } from '../_utils'

export async function GET() { const user = await getCurrentUser(); if (!user) return unauthorized(); if (!canManage(user)) return forbidden(); return NextResponse.json(safe({ reports: await prisma.workReport.findMany({ include: { employee: true }, orderBy: { reportDate: 'desc' } }) })) }