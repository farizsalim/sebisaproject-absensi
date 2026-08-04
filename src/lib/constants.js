export const ROLES = {
  HR: 'hr',
  EMPLOYEE: 'employee',
  LEADER: 'leader',
}

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  SICK: 'sick',
  ABSENCE: 'absence',
  HOLIDAY: 'holiday',
  NO_CHECKOUT: 'no_checkout',
  EARLY_LEAVE: 'early_leave',
}

export const ABSENCE_TYPE = {
  SICK: 'sick',
  LEAVE: 'leave',
  PERMISSION: 'permission',
  UNPAID: 'unpaid',
}

export const ABSENCE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

export const WORK_REPORT_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  REVIEWED: 'reviewed',
  APPROVED: 'approved',
}

export const ASSESSMENT_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
}

export const NOTIFICATION_TYPES = {
  ABSENCE_APPROVED: 'absence_approved',
  ABSENCE_REJECTED: 'absence_rejected',
  WORK_REPORT_REVIEWED: 'work_report_reviewed',
  ANNOUNCEMENT: 'announcement',
}

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CURRENT_USER: '/user',

  // Employee
  EMPLOYEES: '/hr/employees',
  EMPLOYEE_DETAIL: (id) => `/hr/employees/${id}`,

  // Attendance
  ATTENDANCES: '/hr/attendances',
  CLOCK_IN: '/employee/clock',
  ATTENDANCE_HISTORY: '/employee/attendance-history',
  MANUAL_ATTENDANCE: '/hr/attendances/manual',

  // Absence
  ABSENCES: '/employee/absences',
  HR_ABSENCES: '/hr/absence-requests',

  // Work Reports
  WORK_REPORTS: '/employee/work-reports',
  HR_WORK_REPORTS: '/hr/work-reports',

  // Dashboard
  DASHBOARD: '/dashboard',
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
}

export const MESSAGES = {
  LOADING: 'Memuat...',
  SUCCESS: 'Berhasil!',
  ERROR: 'Terjadi kesalahan',
  CONFIRM_DELETE: 'Apakah Anda yakin ingin menghapus?',
  SESSION_EXPIRED: 'Sesi Anda telah berakhir. Silakan login kembali.',
}

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 10,
}

export const DATE_FORMAT = {
  DISPLAY: 'DD MMM YYYY',
  INPUT: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATETIME: 'DD MMM YYYY HH:mm',
}
