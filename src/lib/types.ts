/**
 * Database & API Types for Sebisa Presensi Frontend
 * Generated from Laravel Backend Schema
 */

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export type UserRole = 'leader' | 'hr' | 'employee'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  user: User
  token?: string
  message?: string
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  password_confirmation: string
  company?: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  email: string
  password: string
  password_confirmation: string
}

// ============================================================================
// EMPLOYEE TYPES
// ============================================================================

export type EmploymentStatus = 'permanent' | 'contract' | 'internship' | 'probation'

export interface Employee {
  id: number
  user_id: number
  employee_number: string
  full_name: string
  division: string
  position: string
  employment_status?: EmploymentStatus
  job_level?: string
  batch?: string
  phone?: string
  onboarding_date: string
  offboarding_date?: string | null
  birth_date?: string
  birth_place?: string
  domicile?: string
  education_institution?: string
  major?: string
  student_id?: string
  face_descriptor?: number[] | null
  face_registered_at?: string | null
  notes?: string
  is_active?: boolean
  initials?: string
  deleted_at?: string | null
  created_at: string
  updated_at: string
}

export interface CreateEmployeeRequest {
  name: string
  email: string
  full_name: string
  division: string
  position: string
  employment_status?: EmploymentStatus
  job_level?: string
  batch?: string
  phone?: string
  onboarding_date: string
  birth_date?: string
  birth_place?: string
  domicile?: string
  education_institution?: string
  major?: string
  student_id?: string
}

export interface UpdateEmployeeRequest {
  full_name?: string
  division?: string
  position?: string
  employment_status?: EmploymentStatus
  job_level?: string
  batch?: string
  phone?: string
  onboarding_date?: string
  offboarding_date?: string
  birth_date?: string
  birth_place?: string
  domicile?: string
  education_institution?: string
  major?: string
  student_id?: string
  notes?: string
}

// ============================================================================
// ATTENDANCE TYPES
// ============================================================================

export type AttendanceStatus = 'present' | 'late' | 'sick' | 'absence' | 'holiday' | 'absent' | 'no_checkout'
export type AttendanceSource = 'mobile' | 'web' | 'face' | 'manual'

export interface Attendance {
  id: number
  employee_id: number
  attendance_date: string
  clock_in_at?: string | null
  clock_out_at?: string | null
  status: AttendanceStatus
  source?: AttendanceSource
  clock_in_ip?: string
  clock_out_ip?: string
  clock_in_user_agent?: string
  clock_out_user_agent?: string
  hr_notes?: string
  created_by?: number
  created_at: string
  updated_at: string
}

export interface ClockInRequest {
  latitude?: number
  longitude?: number
  accuracy?: number
  note?: string
  face_image?: File
}

export interface ClockOutRequest {
  latitude?: number
  longitude?: number
  accuracy?: number
  note?: string
}

export interface AttendanceLog {
  id: number
  attendance_id: number
  type: 'clock_in' | 'clock_out'
  timestamp: string
  latitude?: number
  longitude?: number
  accuracy?: number
  ip_address?: string
  user_agent?: string
  note?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// ABSENCE REQUEST TYPES
// ============================================================================

export type AbsenceType = 'sick' | 'absence'
export type AbsenceStatus = 'pending' | 'approved' | 'rejected'

export interface AbsenceRequest {
  id: number
  employee_id: number
  request_type: AbsenceType
  request_date: string
  reason: string
  proof_file_path?: string
  proof_file_name?: string
  status: AbsenceStatus
  reviewed_by?: number
  reviewed_at?: string | null
  hr_note?: string
  created_at: string
  updated_at: string
}

export interface CreateAbsenceRequest {
  request_type: AbsenceType
  request_date: string
  reason: string
  proof_file?: File
}

export interface ApproveAbsenceRequest {
  hr_note?: string
}

export interface RejectAbsenceRequest {
  reason: string
}

// ============================================================================
// WORK REPORT TYPES
// ============================================================================

export type WorkReportAssessmentStatus = 'pending' | 'reviewed'

export interface WorkReport {
  id: number
  employee_id: number
  report_date: string
  title: string
  description: string
  work_start_at: string
  work_end_at: string
  score?: number | null
  reviewed_by?: number
  reviewed_at?: string | null
  review_note?: string
  assessment_status: WorkReportAssessmentStatus
  created_at: string
  updated_at: string
  files?: WorkReportFile[]
}

export interface CreateWorkReportRequest {
  report_date: string
  title: string
  description: string
  work_start_at: string
  work_end_at: string
  files?: File[]
}

export interface WorkReportFile {
  id: number
  work_report_id: number
  file_path: string
  file_name: string
  file_type: 'image' | 'document' | 'video'
  file_size: number
  created_at: string
  updated_at: string
}

export interface UpdateWorkReportAssessmentRequest {
  score: number
  review_note?: string
}

// ============================================================================
// EMPLOYEE ASSESSMENT TYPES
// ============================================================================

export interface EmployeeAssessment {
  id: number
  employee_id: number
  assessment_period: string
  attendance_score: number
  performance_score: number
  behavior_score: number
  technical_score?: number | null
  overall_score: number
  reviewer_comments?: string
  reviewed_by?: number
  reviewed_at?: string | null
  status: 'pending' | 'completed'
  created_at: string
  updated_at: string
}

// ============================================================================
// EMPLOYEE FACE EMBEDDING TYPES
// ============================================================================

export interface EmployeeFaceEmbedding {
  id: number
  employee_id: number
  face_descriptor: number[]
  face_image_path?: string
  registered_at: string
  created_at: string
  updated_at: string
}

export interface EnrollFaceRequest {
  face_image: File
  face_descriptor?: number[]
}

// ============================================================================
// ANNOUNCEMENT TYPES
// ============================================================================

export interface Announcement {
  id: number
  title: string
  content: string
  posted_by: number
  posted_at: string
  expired_at?: string | null
  is_important: boolean
  created_at: string
  updated_at: string
}

export interface CreateAnnouncementRequest {
  title: string
  content: string
  expired_at?: string
  is_important?: boolean
}

// ============================================================================
// PUBLIC HOLIDAY TYPES
// ============================================================================

export type HolidayType = 'national' | 'company' | 'regional'

export interface PublicHoliday {
  id: number
  name: string
  date: string
  holiday_type: HolidayType
  description?: string
  created_by?: number
  created_at: string
  updated_at: string
}

export interface CreatePublicHolidayRequest {
  name: string
  date: string
  holiday_type: HolidayType
  description?: string
}

// ============================================================================
// PAGINATION & LIST RESPONSE TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  per_page: number
  total: number
  last_page: number
  from: number
  to: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

// ============================================================================
// FILTER & SEARCH TYPES
// ============================================================================

export interface EmployeeFilters {
  page?: number
  search?: string
  division?: string
  position?: string
  employment_status?: EmploymentStatus
  is_active?: boolean
  per_page?: number
}

export interface AttendanceFilters {
  page?: number
  employee_id?: number
  status?: AttendanceStatus
  start_date?: string
  end_date?: string
  per_page?: number
}

export interface AbsenceFilters {
  page?: number
  employee_id?: number
  status?: AbsenceStatus
  request_type?: AbsenceType
  start_date?: string
  end_date?: string
  per_page?: number
}

export interface WorkReportFilters {
  page?: number
  employee_id?: number
  assessment_status?: WorkReportAssessmentStatus
  start_date?: string
  end_date?: string
  per_page?: number
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface DashboardStats {
  total_employees?: number
  present_today?: number
  absent_today?: number
  pending_absences?: number
  pending_reports?: number
}

export interface DashboardChartData {
  date: string
  count: number
  [key: string]: string | number
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType = 
  | 'absence_approved' 
  | 'absence_rejected' 
  | 'work_report_reviewed' 
  | 'announcement'

export interface Notification {
  id: number
  user_id: number
  type: NotificationType
  title: string
  message: string
  related_id?: number
  read_at?: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status?: number
}

// ============================================================================
// FORM STATE TYPES
// ============================================================================

export interface FormState<T> {
  data: T
  errors: Record<string, string>
  isSubmitting: boolean
  isDirty: boolean
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type ExportFormat = 'xlsx' | 'pdf'

export interface ExportRequest {
  format: ExportFormat
  filters?: Record<string, any>
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Hadir',
  late: 'Terlambat',
  sick: 'Sakit',
  absence: 'Izin Absen',
  holiday: 'Libur',
  absent: 'Tidak Hadir',
  no_checkout: 'Belum Checkout',
}

export const ABSENCE_STATUS_LABELS: Record<AbsenceStatus, string> = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
}

export const ABSENCE_TYPE_LABELS: Record<AbsenceType, string> = {
  sick: 'Izin Sakit',
  absence: 'Izin Absen',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  leader: 'Leader',
  hr: 'HR Manager',
  employee: 'Karyawan',
}

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  permanent: 'Tetap',
  contract: 'Kontrak',
  internship: 'Magang',
  probation: 'Probasi',
}

export const HOLIDAY_TYPE_LABELS: Record<HolidayType, string> = {
  national: 'Libur Nasional',
  company: 'Libur Perusahaan',
  regional: 'Libur Regional',
}
