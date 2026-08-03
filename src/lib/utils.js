export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(date, format = 'DD MMM YYYY') {
  if (!date) return '-'
  const d = new Date(date)
  
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthName = months[d.getMonth()]
  
  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('MMM', monthName)
    .replace('YYYY', year)
}

export function formatTime(time) {
  if (!time) return '-'
  if (typeof time === 'string' && /^\d{1,2}:\d{2}/.test(time)) {
    const [hours, minutes] = time.split(':')
    return `${hours.padStart(2, '0')}:${minutes}`
  }
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(time))
}

export function formatTimeInput(time) {
  if (!time) return ''
  const date = new Date(time)
  if (Number.isNaN(date.getTime())) return ''
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function formatDateTime(datetime) {
  if (!datetime) return '-'
  const date = new Date(datetime)
  return formatDate(date) + ' ' + formatTime(date)
}

export function getInitials(name) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function truncateText(text, length = 50) {
  if (!text) return '-'
  return text.length > length ? text.substring(0, length) + '...' : text
}

export function formatNumber(num) {
  return new Intl.NumberFormat('id-ID').format(num)
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function getStatusColor(status) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-yellow-100 text-yellow-800',
    draft: 'bg-slate-100 text-slate-800',
    submitted: 'bg-blue-100 text-blue-800',
  }
  return colors[status] || 'bg-slate-100 text-slate-800'
}

export function getStatusLabel(status) {
  const labels = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    present: 'Hadir',
    absent: 'Absen',
    late: 'Terlambat',
    draft: 'Draf',
    submitted: 'Dikirim',
  }
  return labels[status] || status
}

export async function downloadFile(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export function handleApiError(error) {
  if (error.response) {
    return error.response.data.message || 'Terjadi kesalahan'
  } else if (error.request) {
    return 'Tidak ada respon dari server'
  } else {
    return error.message || 'Terjadi kesalahan'
  }
}
