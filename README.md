# Sebisa Project Absensi

Website absensi dan administrasi employee berbasis Next.js, Prisma, dan MariaDB. Aplikasi memiliki portal employee serta console operasional untuk HR dan leader.

## Fitur Utama

### Portal Employee

- Login, registrasi, logout, dan session berbasis cookie HttpOnly.
- Dashboard employee dengan ringkasan presensi, izin, laporan, hari libur, dan pengumuman.
- Clock in dan clock out harian.
- Riwayat presensi berdasarkan periode.
- Status presensi otomatis: hadir, terlambat, belum checkout, dan tidak hadir.
- Pengajuan izin, cuti, dan sakit.
- Riwayat status pengajuan izin.
- Pembuatan dan pengelolaan laporan kerja.
- Rencana fitur Face ID untuk pendaftaran descriptor dan pengenalan wajah employee.
- Pengelolaan profil dan perubahan password.
- Inbox notifikasi.

### Console HR

- Dashboard operasional HR.
- Daftar employee aktif.
- Tambah dan nonaktifkan employee.
- Monitoring presensi employee.
- Input presensi manual.
- Edit presensi dan audit perubahan.
- Filter presensi berdasarkan tanggal, employee, dan status.
- Ringkasan jumlah hadir, terlambat, belum checkout, dan tidak hadir.
- Export data presensi, pengajuan izin, dan laporan kerja dalam CSV.
- Review, approve, dan reject pengajuan izin.
- Catatan HR pada pengajuan izin.
- Review laporan kerja dan pemberian nilai assessment.
- Pengelolaan pengumuman.
- CRUD hari libur perusahaan.
- Pengelolaan jadwal shift employee.
- Pengaturan jam clock in/out, periode berlaku, hari kerja, dan status aktif shift.

### Console Leader

- Semua fitur operasional HR.
- Manajemen akun HR.
- Perubahan role employee menjadi HR atau pengembalian role menjadi employee.

## Aturan Presensi

- Batas clock in default adalah `09:00`.
- Batas tersebut dapat diubah melalui environment variable `ATTENDANCE_CLOCK_IN_DEADLINE`.
- Clock out hanya dapat dilakukan setelah clock in.
- Clock out tidak boleh lebih awal dari clock in.
- Satu employee hanya dapat memiliki satu presensi per tanggal.
- Tanggal presensi menggunakan timezone aplikasi `Asia/Jakarta` secara default.
- Hari kerja assessment dihitung Senin sampai Jumat dan public holiday dikecualikan.
- Assessment menghitung jumlah hadir, terlambat, sakit, izin, belum checkout, alpha, serta skor attendance.

## Route Utama

| Area | Route |
| --- | --- |
| Login | `/login` |
| Employee dashboard | `/dashboard` |
| Presensi employee | `/employee/clock` |
| Riwayat presensi | `/employee/attendance-history` |
| Pengajuan izin | `/employee/absences` |
| Laporan kerja | `/employee/work-reports` |
| Pendaftaran wajah | `/employee/face-registration` |
| HR console | `/console` |
| Employee management | `/hr/employees` |
| Monitoring presensi | `/hr/attendances` |
| Jadwal shift | `/hr/shifts` |
| Review izin | `/hr/absence-requests` |
| Review laporan | `/hr/work-reports` |
| Pengumuman | `/hr/announcements` |
| Hari libur | `/hr/public-holidays` |
| Manajemen akun HR | `/leader/admins` |

## Teknologi

- Next.js App Router
- React dan JavaScript/JSX
- Prisma Client
- MariaDB/MySQL
- Tailwind CSS
- Material Symbols
- HMAC-signed HttpOnly session cookie

## Menjalankan Project

Install dependency:

```bash
npm install
```

Siapkan environment variable, minimal:

```env
DATABASE_URL="mysql://user:password@localhost:3306/sebisa"
SESSION_SECRET="ganti-dengan-secret-yang-kuat"
```

Generate Prisma Client:

```bash
npx prisma generate
```

Jalankan development server:

```bash
npm run dev
```

Buka [http://localhost:3001](http://localhost:3001).

## Struktur Project

```text
src/
  app/                 Halaman dan API Route Handlers Next.js
  components/         Shell, dashboard, form, dan halaman berbasis role
  lib/                 Auth, Prisma, password, tanggal, attendance, dan utilitas
  services/            Service API lama yang masih dipertahankan
prisma/
  schema.prisma        Model database MariaDB
public/images/         Logo dan asset aplikasi
```

## Catatan Pengembangan

Fitur yang masih dalam pengembangan atau belum tersedia penuh:

- Verifikasi email dan forgot/reset password berbasis email.
- Face ID, termasuk pendaftaran descriptor dan face recognition kamera secara langsung.
- Upload bukti izin dan lampiran laporan.
- Export Excel/PDF.
- Histori assessment per periode dan finalisasi assessment terpisah.
- Middleware redirect server-side dan automated tests.
