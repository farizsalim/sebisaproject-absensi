================================================================================
DOKUMENTASI DATABASE SCHEMA - SEBISA PRESENSI
================================================================================
Last Updated: 2026-08-01
Database: MySQL/MariaDB
Backend: Laravel 11

================================================================================
1. TABEL: users
================================================================================

Tujuan: Menyimpan data autentikasi pengguna (login account)

Kolom:
┌─ id (PK)                    : unsignedBigInteger (Primary Key)
├─ name                       : string - Nama pengguna
├─ email (UNIQUE)             : string - Email untuk login (unique)
├─ email_verified_at          : timestamp nullable - Waktu verifikasi email
├─ password                   : string - Password ter-hash
├─ role                       : string enum('leader', 'hr', 'employee')
├─ remember_token            : string nullable - Token "remember me"
├─ created_at                 : timestamp - Dibuat saat
└─ updated_at                 : timestamp - Diupdate saat

Relationships:
- hasOne: Employee (satu user punya satu employee profile)

Role Types:
- 'leader'   : Direktur/Pimpinan tertinggi
- 'hr'       : HR Manager (mengelola employee)
- 'employee' : Karyawan biasa

Example:
{
  "id": 1,
  "name": "Fariz Salim",
  "email": "fariz@sebisa.com",
  "role": "leader",
  "email_verified_at": "2026-07-30T10:00:00Z",
  "created_at": "2026-07-01T08:00:00Z"
}

================================================================================
2. TABEL: employees
================================================================================

Tujuan: Menyimpan data profile karyawan (detail personal & profesi)

Kolom:
┌─ id (PK)                    : unsignedBigInteger (Primary Key)
├─ user_id (FK, UNIQUE)       : unsignedBigInteger - Foreign Key ke users (1-1)
├─ employee_number (UNIQUE)   : string - Nomor karyawan (auto-generate)
├─ full_name                  : string - Nama lengkap karyawan
├─ division (INDEX)           : string - Divisi/Departemen
├─ position (INDEX)           : string - Jabatan/Posisi
├─ employment_status          : string - Status pekerjaan
├─ job_level                  : string nullable - Level/Grade
├─ batch                      : string nullable - Batch kelulusan/masuk
├─ phone                      : string nullable - Nomor telepon
├─ onboarding_date            : date - Tanggal masuk
├─ offboarding_date           : date nullable - Tanggal keluar (jika ada)
├─ birth_date                 : date nullable - Tanggal lahir
├─ birth_place                : string nullable - Tempat lahir
├─ domicile                   : string nullable - Alamat domisili
├─ education_institution      : string nullable - Institusi pendidikan
├─ major                      : string nullable - Jurusan
├─ student_id                 : string nullable - Nomor ID student
├─ face_descriptor            : json nullable - Data wajah untuk recognition
├─ face_registered_at         : timestamp nullable - Waktu registrasi wajah
├─ notes                      : text nullable - Catatan internal
├─ deleted_at                 : timestamp nullable - Soft delete timestamp
├─ created_at                 : timestamp
└─ updated_at                 : timestamp

Relationships:
- belongsTo: User (user_id)
- hasMany: Attendance
- hasMany: AbsenceRequest
- hasMany: WorkReport
- hasMany: EmployeeAssessment
- hasMany: EmployeeFaceEmbedding

Example:
{
  "id": 1,
  "user_id": 1,
  "employee_number": "EMP-001",
  "full_name": "Fariz Salim",
  "division": "IT",
  "position": "Full Stack Developer",
  "employment_status": "permanent",
  "job_level": "Senior",
  "batch": "2020",
  "phone": "081234567890",
  "onboarding_date": "2020-01-15",
  "birth_date": "1998-05-12",
  "birth_place": "Jakarta",
  "domicile": "Tangerang Selatan",
  "is_active": true,
  "initials": "FS"
}

================================================================================
3. TABEL: attendances
================================================================================

Tujuan: Menyimpan data kehadiran harian (clock in/out)

Kolom:
┌─ id (PK)                    : unsignedBigInteger (Primary Key)
├─ employee_id (FK, INDEX)    : unsignedBigInteger - Foreign Key ke employees
├─ attendance_date (INDEX)    : date - Tanggal kehadiran
├─ clock_in_at                : timestamp nullable - Waktu masuk
├─ clock_out_at               : timestamp nullable - Waktu pulang
├─ status                     : string - Status kehadiran
├─ source                     : string nullable - Sumber (mobile, web, face)
├─ clock_in_ip                : string nullable - IP saat clock in
├─ clock_out_ip               : string nullable - IP saat clock out
├─ clock_in_user_agent        : string nullable - Device info saat in
├─ clock_out_user_agent       : string nullable - Device info saat out
├─ hr_notes                   : text nullable - Catatan dari HR
├─ created_by (FK)            : unsignedBigInteger nullable - User yang create
├─ created_at                 : timestamp
└─ updated_at                 : timestamp

Status Values:
- 'present'      : Hadir tepat waktu
- 'late'         : Terlambat datang
- 'sick'         : Izin sakit
- 'absence'      : Izin absen
- 'holiday'      : Libur
- 'absent'       : Tidak hadir (alpa)
- 'no_checkout'  : Belum checkout (belum clock out)

================================================================================
3A. TABEL: shifts
================================================================================

Tujuan: Menyimpan jadwal kerja employee untuk menentukan batas clock in dan clock out.

Kolom:
┌─ id (PK)                    : unsignedBigInteger
├─ employee_id (FK, INDEX)    : unsignedBigInteger - Employee pemilik shift
├─ name                       : varchar(100) - Nama shift
├─ clock_in_deadline          : time - Batas waktu clock in
├─ clock_out_deadline         : time - Batas waktu clock out normal
├─ effective_from             : date - Mulai berlaku
├─ effective_to               : date nullable - Akhir berlaku
├─ work_days                  : varchar(20) - Hari kerja, default 1,2,3,4,5
├─ is_active                  : boolean - Status shift
├─ created_at                 : timestamp
└─ updated_at                 : timestamp

Catatan: work_days menggunakan ISO weekday: 1 Senin sampai 7 Minggu.

Relationships:
- belongsTo: Employee (soft delete included)
- belongsTo: User (creator)
- hasMany: AttendanceLog

Example:
{
  "id": 1,
  "employee_id": 1,
  "attendance_date": "2026-07-30",
  "clock_in_at": "2026-07-30T08:15:00Z",
  "clock_out_at": "2026-07-30T17:30:00Z",
  "status": "late",
  "source": "mobile",
  "clock_in_ip": "192.168.1.100",
  "hr_notes": "Terlambat 15 menit karena macet"
}

================================================================================
4. TABEL: attendance_logs
================================================================================

Tujuan: Menyimpan log detail setiap clock in/out (untuk audit trail)

Kolom:
┌─ id (PK)                    : unsignedBigInteger (Primary Key)
├─ attendance_id (FK)         : unsignedBigInteger - Foreign Key ke attendances
├─ type                       : string - 'clock_in' atau 'clock_out'
├─ timestamp                  : timestamp - Waktu event
├─ latitude                   : decimal nullable - Koordinat GPS
├─ longitude                  : decimal nullable - Koordinat GPS
├─ accuracy                   : decimal nullable - Akurasi GPS
├─ ip_address                 : string nullable
├─ user_agent                 : text nullable - Browser/Device info
├─ note                       : text nullable
├─ created_at                 : timestamp
└─ updated_at                 : timestamp

Relationships:
- belongsTo: Attendance

Example:
{
  "id": 1,
  "attendance_id": 1,
  "type": "clock_in",
  "timestamp": "2026-07-30T08:15:00Z",
  "latitude": "-6.2088",
  "longitude": "106.8556",
  "accuracy": 5.5,
  "note": "Clock in via mobile app"
}

================================================================================
5. TABEL: absence_requests
================================================================================

Tujuan: Menyimpan permintaan izin/cuti dari karyawan

Kolom:
┌─ id (PK)                    : unsignedBigInteger (Primary Key)
├─ employee_id (FK, INDEX)    : unsignedBigInteger - Foreign Key ke employees
├─ request_type               : string - Tipe izin ('sick', 'absence')
├─ request_date (INDEX)       : date - Tanggal izin
├─ reason                     : text - Alasan izin
├─ proof_file_path            : string nullable - Path file bukti
├─ proof_file_name            : string nullable - Nama file bukti
├─ status (INDEX)             : string - Status approval
├─ reviewed_by (FK)           : unsignedBigInteger nullable - User HR reviewer
├─ reviewed_at                : timestamp nullable - Waktu review
├─ hr_note                    : text nullable - Catatan dari HR
├─ created_at                 : timestamp
└─ updated_at                 : timestamp

Request Type:
- 'sick'    : Izin sakit (perlu bukti medis)
- 'absence' : Izin absen (cuti, keperluan, dll)

Status:
- 'pending'  : Menunggu persetujuan
- 'approved' : Sudah disetujui
- 'rejected' : Ditolak

Relationships:
- belongsTo: Employee (soft delete included)
- belongsTo: User (reviewer)

Example:
{
  "id": 1,
  "employee_id": 1,
  "request_type": "sick",
  "request_date": "2026-07-30",
  "reason": "Demam tinggi",
  "proof_file_path": "storage/absence/001.pdf",
  "status": "approved",
  "reviewed_by": 2,
  "reviewed_at": "2026-07-30T14:00:00Z",
  "hr_note": "Disetujui, sudah ada surat dokter"
}

================================================================================
6. TABEL: work_reports
================================================================================

Tujuan: Menyimpan laporan kerja harian/mingguan dari karyawan

Kolom:
┌─ id (PK)                    : unsignedBigInteger (Primary Key)
├─ employee_id (FK, INDEX)    : unsignedBigInteger - Foreign Key ke employees
├─ report_date (INDEX)        : date - Tanggal laporan
├─ title                      : string - Judul laporan
├─ description                : text - Deskripsi pekerjaan
├─ work_start_at              : timestamp - Jam mulai kerja
├─ work_end_at                : timestamp - Jam selesai kerja
├─ score                      : unsignedTinyInteger nullable - Nilai/rating
├─ reviewed_by (FK)           : unsignedBigInteger nullable - User reviewer (HR)
├─ reviewed_at                : timestamp nullable - Waktu review
├─ review_note                : text nullable - Feedback reviewer
├─ assessment_status          : string - Status penilaian
├─ created_at                 : timestamp
└─ updated_at                 : timestamp

Assessment Status:
- 'pending'  : Menunggu penilaian
- 'reviewed' : Sudah dinilai

Relationships:
- belongsTo: Employee (soft delete included)
- belongsTo: User (reviewer)
- hasMany: WorkReportFile

Example:
{
  "id": 1,
  "employee_id": 1,
  "report_date": "2026-07-30",
  "title": "Development Frontend Dashboard",
  "description": "Membuat halaman dashboard dengan React...",
  "work_start_at": "2026-07-30T09:00:00Z",
  "work_end_at": "2026-07-30T17:00:00Z",
  "score": 85,
  "reviewed_by": 2,
  "reviewed_at": "2026-07-31T10:00:00Z",
  "assessment_status": "reviewed"
}

================================================================================
7. TABEL: work_report_files
================================================================================

Tujuan: Menyimpan file attachment dari work report (foto, doc, screenshot)

Kolom:
┌─ id (PK)                    : unsignedBigInteger (Primary Key)
├─ work_report_id (FK)        : unsignedBigInteger - Foreign Key ke work_reports
├─ file_path                  : string - Path file di storage
├─ file_name                  : string - Nama file original
├─ file_type                  : string - Tipe file (image, document, etc)
├─ file_size                  : unsignedBigInteger - Ukuran dalam bytes
├─ created_at                 : timestamp
└─ updated_at                 : timestamp

File Type:
- 'image'    : Foto/screenshot
- 'document' : PDF, Word, Excel, etc
- 'video'    : Video files

Relationships:
- belongsTo: WorkReport

Example:
{
  "id": 1,
  "work_report_id": 1,
  "file_path": "storage/work-reports/001_screenshot.png",
  "file_name": "dashboard_screenshot.png",
  "file_type": "image",
  "file_size": 2048576
}

================================================================================
8. TABEL: employee_assessments
================================================================================

Tujuan: Menyimpan penilaian kinerja karyawan (evaluation, rating)

Kolom:
┌─ id (PK)                    : unsignedBigInteger (Primary Key)
├─ employee_id (FK, INDEX)    : unsignedBigInteger - Foreign Key ke employees
├─ assessment_period          : string - Periode (e.g., "2026-Q3")
├─ attendance_score           : unsignedTinyInteger - Score kehadiran (0-100)
├─ performance_score          : unsignedTinyInteger - Score performa (0-100)
├─ behavior_score             : unsignedTinyInteger - Score perilaku (0-100)
├─ technical_score            : unsignedTinyInteger nullable - Score skill teknis
├─ overall_score              : unsignedTinyInteger - Score keseluruhan
├─ reviewer_comments          : text nullable - Komentar reviewer
├─ reviewed_by (FK)           : unsignedBigInteger nullable - User reviewer
├─ reviewed_at                : timestamp nullable - Waktu review
├─ status                     : string - Status ('pending', 'completed')
├─ created_at                 : timestamp
└─ updated_at                 : timestamp

Relationships:
- belongsTo: Employee (soft delete included)
- belongsTo: User (reviewer)

Example:
{
  "id": 1,
  "employee_id": 1,
  "assessment_period": "2026-Q2",
  "attendance_score": 90,
  "performance_score": 85,
  "behavior_score": 88,
  "technical_score": 92,
  "overall_score": 88,
  "reviewed_by": 2,
  "reviewed_at": "2026-06-30T15:00:00Z",
  "status": "completed"
}

================================================================================
9. TABEL: employee_face_embeddings
================================================================================

Tujuan: Menyimpan data biometric wajah untuk face recognition

Kolom:
┌─ id (PK)                    : unsignedBigInteger (Primary Key)
├─ employee_id (FK, INDEX)    : unsignedBigInteger - Foreign Key ke employees
├─ face_descriptor            : json - Vector/embedding data (512-dim array)
├─ face_image_path            : string nullable - Path foto wajah
├─ registered_at              : timestamp - Waktu registrasi
├─ created_at                 : timestamp
└─ updated_at                 : timestamp

Relationships:
- belongsTo: Employee

Note: Face descriptor disimpan sebagai JSON array berukuran 512 dimensi
untuk digunakan dalam face recognition comparison.

Example:
{
  "id": 1,
  "employee_id": 1,
  "face_descriptor": [0.1234, 0.5678, -0.2345, ...(508 more values)],
  "face_image_path": "storage/faces/employee_001.jpg",
  "registered_at": "2026-07-15T10:00:00Z"
}

================================================================================
10. TABEL: announcements
================================================================================

Tujuan: Menyimpan pengumuman dari HR/Management untuk semua karyawan

Kolom:
┌─ id (PK)                    : unsignedBigInteger (Primary Key)
├─ title                      : string - Judul pengumuman
├─ content                    : text - Isi pengumuman
├─ posted_by (FK)             : unsignedBigInteger - User yang posting
├─ posted_at                  : timestamp - Waktu posting
├─ expired_at                 : timestamp nullable - Kapan kadaluarsa
├─ is_important               : boolean - Pengumuman penting?
├─ created_at                 : timestamp
└─ updated_at                 : timestamp

Relationships:
- belongsTo: User (posted_by)

Example:
{
  "id": 1,
  "title": "Perubahan Jam Kerja",
  "content": "Mulai bulan depan jam kerja berubah menjadi...",
  "posted_by": 2,
  "posted_at": "2026-07-30T10:00:00Z",
  "is_important": true
}

================================================================================
11. TABEL: public_holidays
================================================================================

Tujuan: Menyimpan kalender libur nasional/perusahaan

Kolom:
┌─ id (PK)                    : unsignedBigInteger (Primary Key)
├─ name                       : string - Nama hari libur
├─ date (UNIQUE)              : date - Tanggal libur
├─ holiday_type               : string - Tipe ('national', 'company', 'regional')
├─ description                : text nullable - Deskripsi
├─ created_by (FK)            : unsignedBigInteger nullable - User creator
├─ created_at                 : timestamp
└─ updated_at                 : timestamp

Holiday Type:
- 'national' : Libur nasional resmi
- 'company'  : Libur perusahaan khusus
- 'regional' : Libur regional tertentu

Relationships:
- belongsTo: User (created_by)

Example:
{
  "id": 1,
  "name": "Hari Raya Lebaran",
  "date": "2026-08-15",
  "holiday_type": "national",
  "description": "Libur nasional Idul Fitri 2026"
}

================================================================================
DATABASE RELATIONSHIPS DIAGRAM
================================================================================

users (1) ──────→ (∞) employees
  |
  ├─→ (∞) attendance_logs (created_by)
  ├─→ (∞) absence_requests (reviewed_by)
  ├─→ (∞) work_reports (reviewed_by)
  ├─→ (∞) employee_assessments (reviewed_by)
  └─→ (∞) announcements (posted_by)

employees (1) ──────→ (∞) attendances
          (1) ──────→ (∞) absence_requests
          (1) ──────→ (∞) work_reports
          (1) ──────→ (∞) employee_assessments
          (1) ──────→ (∞) employee_face_embeddings

attendances (1) ──────→ (∞) attendance_logs

work_reports (1) ──────→ (∞) work_report_files

================================================================================
INDEX OPTIMIZATION
================================================================================

Important Indexes untuk query performance:
- employees.user_id (UNIQUE)
- employees.employee_number (UNIQUE)
- employees.division
- employees.position
- employees.offboarding_date
- attendances.employee_id
- attendances.attendance_date
- absence_requests.employee_id
- absence_requests.request_date
- absence_requests.status
- work_reports.employee_id
- work_reports.report_date
- employee_assessments.employee_id
- employee_face_embeddings.employee_id
- public_holidays.date (UNIQUE)

================================================================================
MIGRATION FILES
================================================================================

Urutan eksekusi migration (penting karena FK dependency):
1. 0001_01_01_000000_create_users_table.php
   └─ Buat table users

2. 2026_06_05_000001_add_role_to_users_table.php
   └─ Add kolom role ke users

3. 2026_06_05_000002_create_employees_table.php
   └─ Buat table employees (FK ke users)

4. 2026_06_05_000003_create_attendances_table.php
   └─ Buat table attendances (FK ke employees, users)

5. 2026_06_05_000004_create_attendance_logs_table.php
   └─ Buat table attendance_logs (FK ke attendances)

6. 2026_06_05_000005_create_absence_requests_table.php
   └─ Buat table absence_requests (FK ke employees, users)

7. 2026_06_05_000006_create_work_reports_table.php
   └─ Buat table work_reports (FK ke employees, users)

8. 2026_06_05_000007_create_work_report_files_table.php
   └─ Buat table work_report_files (FK ke work_reports)

9. 2026_06_05_000008_create_employee_face_embeddings_table.php
   └─ Buat table employee_face_embeddings (FK ke employees)

10. 2026_06_06_000001_create_public_holidays_table.php
    └─ Buat table public_holidays (FK ke users)

11. 2026_06_22_000001_add_assessment_fields_to_work_reports_table.php
    └─ Buat table employee_assessments (FK ke employees, users)

12. [Custom Migrations] create_announcements_table.php
    └─ Buat table announcements (FK ke users)

================================================================================
SOFT DELETE IMPLEMENTATION
================================================================================

Tables yang menggunakan Soft Delete (SoftDeletes trait):
- employees   : deleted_at
  → Employee yang resign tetap tersimpan, bisa di-restore

Soft Delete Query:
- Active records   : WHERE deleted_at IS NULL
- Trashed records  : WHERE deleted_at IS NOT NULL
- All records      : Tanpa WHERE clause
- Restore trashed  : UPDATE deleted_at = NULL

Laravel Methods:
- Model::all()              → Hanya active (tidak ada soft delete)
- Model::withTrashed()      → Semua records (active + soft delete)
- Model::onlyTrashed()      → Hanya soft delete
- Model::restore()          → Restore soft delete record
- Model::forceDelete()      → Permanent delete

================================================================================
TIMESTAMPS IMPLEMENTATION
================================================================================

Setiap table punya:
- created_at : Waktu record dibuat (auto set)
- updated_at : Waktu record terakhir diupdate (auto set)

Format: Timezone UTC
Casting: datetime (otomatis convert ke UTC datetime object)

Contoh query by date:
- Attendance hari ini  : WHERE DATE(attendance_date) = DATE(NOW())
- Report bulan ini     : WHERE MONTH(report_date) = MONTH(NOW())
- Created 7 hari lalu  : WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)

================================================================================
NEXT.JS FRONTEND INTEGRATION NOTES
================================================================================

Untuk membuat API services di Next.js, perhatikan:

1. User Model → useAuth hook
   - Login check berdasarkan user.role
   - Role-based navigation

2. Employee Model → employeeService
   - GET /api/hr/employees → get employees list
   - POST /api/hr/employees → create employee
   - PATCH /api/hr/employees/{id} → update employee
   - DELETE /api/hr/employees/{id} → delete employee

3. Attendance Model → attendanceService
   - POST /api/employee/clock → clock in/out
   - GET /api/hr/attendances → get attendance data
   - POST /api/hr/attendances/manual → manual entry

4. AbsenceRequest Model → absenceService
   - POST /api/employee/absences → create absence
   - GET /api/hr/absence-requests → get pending requests
   - PATCH /api/hr/absence-requests/{id}/approve → approve
   - PATCH /api/hr/absence-requests/{id}/reject → reject

5. WorkReport Model → workReportService
   - POST /api/employee/work-reports → create report
   - GET /api/hr/work-reports → get reports for review
   - PATCH /api/hr/work-reports/{id}/assessment → add score

6. EmployeeFaceEmbedding Model → untuk face recognition
   - POST /api/employee/face-registration/enroll → store face
   - GET /api/employee/face/embeddings → get face data

================================================================================
END OF DATABASE DOCUMENTATION
================================================================================
