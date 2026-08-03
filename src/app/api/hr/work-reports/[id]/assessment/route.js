import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManage, forbidden, safe, unauthorized } from '../../../_utils'

function periodFor(date) {
  const reportDate = new Date(date)
  return { start: new Date(reportDate.getFullYear(), reportDate.getMonth(), 1), end: new Date(reportDate.getFullYear(), reportDate.getMonth() + 1, 0) }
}

export async function GET(request, { params }) {
  const user = await getCurrentUser(); if (!user) return unauthorized(); if (!canManage(user)) return forbidden()
  const { id } = await params
  try {
    const report = await prisma.workReport.findUnique({ where: { id: BigInt(id) } })
    if (!report) return NextResponse.json({ message: 'Laporan kerja tidak ditemukan.' }, { status: 404 })
    const period = periodFor(report.reportDate)
    const assessment = await prisma.employeeAssessment.findUnique({ where: { employeeId_periodStart_periodEnd: { employeeId: report.employeeId, periodStart: period.start, periodEnd: period.end } } })
    return NextResponse.json(safe({ assessment }))
  } catch {
    return NextResponse.json({ message: 'Assessment laporan gagal dimuat.' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  const user = await getCurrentUser(); if (!user) return unauthorized(); if (!canManage(user)) return forbidden()
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const score = Number(body.score)
  if (!Number.isFinite(score) || score < 0 || score > 100) return NextResponse.json({ message: 'Nilai harus berupa angka 0 sampai 100.' }, { status: 422 })
  try {
    const report = await prisma.workReport.findUnique({ where: { id: BigInt(id) } })
    if (!report) return NextResponse.json({ message: 'Laporan kerja tidak ditemukan.' }, { status: 404 })
    const period = periodFor(report.reportDate)
    const assessment = await prisma.employeeAssessment.upsert({ where: { employeeId_periodStart_periodEnd: { employeeId: report.employeeId, periodStart: period.start, periodEnd: period.end } }, update: { projectScore: score, finalScore: score, notes: String(body.review_note || '').trim() || null, finalizedBy: user.id, finalizedAt: new Date(), status: 'finalized' }, create: { employeeId: report.employeeId, periodStart: period.start, periodEnd: period.end, projectScore: score, finalScore: score, notes: String(body.review_note || '').trim() || null, finalizedBy: user.id, finalizedAt: new Date(), status: 'finalized' } })
    return NextResponse.json(safe({ message: 'Assessment laporan berhasil disimpan.', assessment }))
  } catch {
    return NextResponse.json({ message: 'Assessment laporan gagal disimpan.' }, { status: 500 })
  }
}
