# Sebisa Presensi

Next.js App Router dengan JavaScript/JSX, Prisma, dan MariaDB. Backend berjalan melalui Route Handlers di aplikasi Next.js.

## Route Pengguna

- `/login`, `/register`: login dan registrasi employee.
- `/forgot-password`, `/reset-password`: UI tersedia; API email reset belum selesai.
- `/dashboard`: dashboard employee.
- `/profile`: edit profil, ubah password, hapus akun.
- `/notifications`: inbox notifikasi dan tandai dibaca.

## Route Employee

- `/employee/clock`: clock in dan clock out.
- `/employee/attendance-history`: riwayat presensi.
- `/employee/absences`: daftar dan pengajuan izin.
- `/employee/work-reports`: daftar dan pembuatan laporan kerja.
- `/employee/face-registration`: simpan descriptor wajah manual.

## Route HR

- `/console`: Console Management System untuk role `hr` dan `leader`.
- `/hr`, `/leader`: route kompatibilitas yang tetap tersedia.
- `/hr/employees`: daftar, tambah, dan nonaktifkan employee.
- `/hr/attendances`: monitoring presensi.
- `/hr/absence-requests`: approval atau penolakan izin.
- `/hr/work-reports`: review daftar laporan kerja.
- `/hr/announcements`: tambah dan hapus pengumuman.
- `/hr/public-holidays`: tambah dan lihat hari libur.

Semua route HR dilindungi role `hr` atau `leader` melalui API.

## Route Leader

- `/leader/admins`: ubah role user `employee` menjadi `hr` atau mengembalikannya.

API admin leader hanya dapat diakses oleh role `leader`.

## Policy Role

- `employee` memakai dashboard pribadi dan aktivitas presensi.
- `hr` memakai menu operasional terbatas di `/console`.
- `leader` memakai `/console` dengan menu lengkap, termasuk pengaturan akun `hr`.
- Redirect setelah login dilakukan otomatis berdasarkan role.

## API Utama

- `/api/auth/*`: login, register, logout, current user.
- `/api/profile`: profil, password, dan hapus akun.
- `/api/dashboard`, `/api/notifications`: data dashboard dan notifikasi.
- `/api/employee/*`: presensi, izin, laporan, riwayat, dan face descriptor.
- `/api/hr/*`: employee, presensi, izin, laporan, pengumuman, dan hari libur.
- `/api/leader/admins`: manajemen role `employee` dan `hr` oleh leader.

## Struktur Kode

```text
src/
  app/                 Halaman dan Route Handlers Next.js
  components/          EmployeeShell, RoleShell, dashboard, dan UI role
  lib/                 Auth session, Prisma, password, constants
  services/             Service API lama yang masih dipertahankan
prisma/
  schema.prisma         Model database MariaDB
public/images/          Asset logo
```

## Status Belum Lengkap

- Email verification dan email forgot/reset password.
- UI detail employee dan edit/hapus hari libur.
- Upload bukti izin dan lampiran laporan.
- Export Excel/PDF; export operasional saat ini tersedia dalam CSV.
- Assessment kinerja lanjutan seperti histori per periode dan finalisasi terpisah.
- GPS dan kamera face recognition.
- Middleware redirect server-side dan automated tests.

## Status Selesai

- Presensi manual HR.
- Edit dan audit perubahan presensi.
- Export CSV presensi, pengajuan izin, dan laporan kerja.
- Assessment laporan kerja dengan nilai dan catatan HR.
- CRUD hari libur HR, termasuk edit, catatan, dan hapus.
- Review izin HR dengan detail alasan dan catatan reviewer.
