import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { canManage, forbidden, unauthorized } from '../_utils'

function csvValue(value) {
  const text = value === null || value === undefined ? '' : String(value)
  return `"${text.replaceAll('"', '""')}"`
}

function csvResponse(filename, headers, rows) {
  const content = `\uFEFF${[headers, ...rows].map((row) => row.map(csvValue).join(',')).join('\r\n')}\r\n`
  return new NextResponse(content, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` } })
}

function dateText(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : ''
}

function timeText(value) {
  return value ? new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value)) : ''
}

export async function GET(request) {
  const user = await getCurrentUser()
  if (!user) return unauthorized()
  if (!canManage(user)) return forbidden()

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const date = searchParams.get('date')
  const where = date ? { ...(type === 'attendances' ? { attendanceDate: new Date(date) } : type === 'absence-requests' ? { requestDate: new Date(date) } : { reportDate: new Date(date) }) } : {}

  if (type === 'attendances') {
    const items = await prisma.attendance.findMany({ where, include: { employee: true }, orderBy: [{ attendanceDate: 'desc' }, { employee: { fullName: 'asc' } }] })
    return csvResponse(`presensi-${date || 'semua'}.csv`, ['Tanggal', 'Nomor Employee', 'Nama Employee', 'Divisi', 'Jam Masuk', 'Jam Pulang', 'Status', 'Sumber'], items.map((item) => [dateText(item.attendanceDate), item.employee.employeeNumber, item.employee.fullName, item.employee.division, timeText(item.clockInAt), timeText(item.clockOutAt), item.status, item.source]))
  }

  if (type === 'absence-requests') {
    const items = await prisma.absenceRequest.findMany({ where, include: { employee: true }, orderBy: { requestDate: 'desc' } })
    return csvResponse(`pengajuan-izin-${date || 'semua'}.csv`, ['Tanggal', 'Nomor Employee', 'Nama Employee', 'Jenis', 'Alasan', 'Status'], items.map((item) => [dateText(item.requestDate), item.employee.employeeNumber, item.employee.fullName, item.requestType, item.reason, item.status]))
  }

  if (type === 'work-reports') {
    const items = await prisma.workReport.findMany({ where, include: { employee: true }, orderBy: { reportDate: 'desc' } })
    return csvResponse(`laporan-kerja-${date || 'semua'}.csv`, ['Tanggal', 'Nomor Employee', 'Nama Employee', 'Judul', 'Deskripsi', 'Jam Mulai', 'Jam Selesai'], items.map((item) => [dateText(item.reportDate), item.employee.employeeNumber, item.employee.fullName, item.title, item.description, timeText(item.workStartAt), timeText(item.workEndAt)]))
  }

  return NextResponse.json({ message: 'Jenis export tidak valid.' }, { status: 422 })
}
