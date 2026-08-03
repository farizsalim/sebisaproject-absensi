import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManage, forbidden, safe, unauthorized } from '../_utils'

export async function GET(request) { const user = await getCurrentUser(); if (!user) return unauthorized(); if (!canManage(user)) return forbidden(); const { searchParams } = new URL(request.url); const date = searchParams.get('date'); const attendances = await prisma.attendance.findMany({ where: date ? { attendanceDate: new Date(date) } : {}, include: { employee: true }, orderBy: { attendanceDate: 'desc' }, take: 500 }); return NextResponse.json(safe({ attendances })) }