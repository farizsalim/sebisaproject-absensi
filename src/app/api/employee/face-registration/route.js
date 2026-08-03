import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const safe = (value) => JSON.parse(JSON.stringify(value, (_, item) => typeof item === 'bigint' ? item.toString() : item))

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 })
  const employee = await prisma.employee.findUnique({ where: { userId: user.id }, include: { faceEmbeddings: true } })
  if (!employee) return NextResponse.json({ message: 'Profil employee belum tersedia.' }, { status: 404 })
  return NextResponse.json(safe({ registeredAt: employee.faceRegisteredAt, faceDescriptor: employee.faceDescriptor, embeddings: employee.faceEmbeddings }))
}

export async function POST(request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ message: 'Unauthenticated.' }, { status: 401 })
  const employee = await prisma.employee.findUnique({ where: { userId: user.id } })
  if (!employee) return NextResponse.json({ message: 'Profil employee belum tersedia.' }, { status: 404 })
  const body = await request.json().catch(() => ({}))
  const descriptor = body.descriptor || body.embedding
  if (!descriptor) return NextResponse.json({ message: 'Data wajah wajib diisi.' }, { status: 422 })
  const embeddings = Array.isArray(descriptor) ? descriptor : [descriptor]
  await prisma.$transaction([
    prisma.employee.update({ where: { id: employee.id }, data: { faceDescriptor: descriptor, faceRegisteredAt: new Date() } }),
    ...embeddings.map((embedding, index) => prisma.employeeFaceEmbedding.upsert({ where: { employeeId_labelPose: { employeeId: employee.id, labelPose: body.labelPose || `pose-${index + 1}` } }, update: { embedding: JSON.stringify(embedding) }, create: { employeeId: employee.id, embedding: JSON.stringify(embedding), labelPose: body.labelPose || `pose-${index + 1}` } })),
  ])
  return NextResponse.json({ message: 'Pendaftaran wajah berhasil.' })
}