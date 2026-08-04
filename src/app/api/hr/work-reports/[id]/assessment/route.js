import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManage, forbidden, safe, unauthorized } from '../../../_utils'
import { dateOnlyRange } from '@/lib/date'

function periodFor(date) {
  const reportDate = new Date(date)
  const year = reportDate.getUTCFullYear()
  const month = reportDate.getUTCMonth() + 1
  return dateOnlyRange(year, month)
}

function workDays(start, end, holidays) {
  const holidayKeys = new Set(holidays.map((holiday) => holiday.holidayDate.toISOString().slice(0, 10)))
  const days = []
  for (let cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const day = cursor.getUTCDay()
    const key = cursor.toISOString().slice(0, 10)
    if (day !== 0 && day !== 6 && !holidayKeys.has(key)) days.push(key)
  }
  return days
}

async function attendanceMetrics(employeeId, period) {
  const [attendances, absences, holidays] = await Promise.all([
    prisma.attendance.findMany({ where: { employeeId, attendanceDate: { gte: period.start, lte: period.end } } }),
    prisma.absenceRequest.findMany({ where: { employeeId, requestDate: { gte: period.start, lte: period.end }, status: 'approved' } }),
    prisma.publicHoliday.findMany({ where: { holidayDate: { gte: period.start, lte: period.end } }, select: { holidayDate: true } }),
  ])
  const effectiveWorkDays = workDays(period.start, period.end, holidays).length
  const counts = attendances.reduce((result, attendance) => {
    if (attendance.status === 'present') result.presentCount += 1
    if (attendance.status === 'late') result.lateCount += 1
    if (attendance.status === 'no_checkout') result.noCheckoutCount += 1
    if (attendance.status === 'absent') result.absentCount += 1
    return result
  }, { presentCount: 0, lateCount: 0, noCheckoutCount: 0, absentCount: 0 })
  const sickCount = absences.filter((absence) => ['sick', 'sakit'].includes(absence.requestType)).length
  const absenceCount = absences.filter((absence) => !['sick', 'sakit'].includes(absence.requestType)).length
  const attendanceScore = effectiveWorkDays === 0 ? 0 : Math.round(((counts.presentCount + (counts.lateCount * 0.8) + (counts.noCheckoutCount * 0.5)) / effectiveWorkDays) * 100)
  return { effectiveWorkDays, ...counts, sickCount, absenceCount, attendanceScore: Math.min(100, attendanceScore) }
}

export async function GET(request, { params }) {
  const user = await getCurrentUser(); if (!user) return unauthorized(); if (!canManage(user)) return forbidden()
  const { id } = await params
  try {
    const report = await prisma.workReport.findUnique({ where: { id: BigInt(id) } })
    if (!report) return NextResponse.json({ message: 'Laporan kerja tidak ditemukan.' }, { status: 404 })
    const period = periodFor(report.reportDate)
    const [assessment, metrics] = await Promise.all([
      prisma.employeeAssessment.findUnique({ where: { employeeId_periodStart_periodEnd: { employeeId: report.employeeId, periodStart: period.start, periodEnd: period.end } } }),
      attendanceMetrics(report.employeeId, period),
    ])
    return NextResponse.json(safe({ assessment: assessment ? { ...assessment, ...metrics } : metrics }))
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
    const reviewNote = String(body.review_note || '').trim() || null
    const metrics = await attendanceMetrics(report.employeeId, period)
    const finalScore = Math.round((metrics.attendanceScore + score) / 2)
    const assessment = await prisma.employeeAssessment.upsert({ where: { employeeId_periodStart_periodEnd: { employeeId: report.employeeId, periodStart: period.start, periodEnd: period.end } }, update: { ...metrics, projectScore: score, finalScore, notes: reviewNote, finalizedBy: user.id, finalizedAt: new Date(), status: 'finalized' }, create: { employeeId: report.employeeId, periodStart: period.start, periodEnd: period.end, ...metrics, projectScore: score, finalScore, notes: reviewNote, finalizedBy: user.id, finalizedAt: new Date(), status: 'finalized' } })
    return NextResponse.json(safe({ message: 'Assessment laporan berhasil disimpan.', assessment }))
  } catch {
    return NextResponse.json({ message: 'Assessment laporan gagal disimpan.' }, { status: 500 })
  }
}
