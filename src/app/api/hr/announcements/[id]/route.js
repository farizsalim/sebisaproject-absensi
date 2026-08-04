import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManage, forbidden, unauthorized } from '../../_utils'

export async function DELETE(_, { params }) { const user = await getCurrentUser(); if (!user) return unauthorized(); if (!canManage(user)) return forbidden(); await prisma.announcement.delete({ where: { id: BigInt(params.id) } }); return NextResponse.json({ message: 'Pengumuman dihapus.' }) }