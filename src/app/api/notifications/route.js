import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function unauthorized() {
  return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 })
}

function serializeNotification(notification) {
  let data = {}
  try {
    data = JSON.parse(notification.data)
  } catch {
    data = { message: notification.data }
  }

  return {
    id: notification.id,
    type: notification.type,
    data,
    read_at: notification.readAt,
    created_at: notification.createdAt,
  }
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return unauthorized()

  const notifications = await prisma.notification.findMany({
    where: { notifiableType: 'App\\Models\\User', notifiableId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return NextResponse.json({
    notifications: notifications.map(serializeNotification),
    unreadCount: notifications.filter((notification) => !notification.readAt).length,
  })
}

export async function PATCH(request) {
  const user = await getCurrentUser()
  if (!user) return unauthorized()

  let body = {}
  try {
    body = await request.json()
  } catch {
    // An empty body marks every notification as read.
  }

  const where = {
    notifiableType: 'App\\Models\\User',
    notifiableId: user.id,
    ...(body.id ? { id: String(body.id) } : {}),
  }

  await prisma.notification.updateMany({
    where,
    data: { readAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
