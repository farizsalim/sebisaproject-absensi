# Sebisa Presensi - Frontend (Next.js)

Sistem manajemen presensi dan kehadiran karyawan yang modern dan responsif.

## 📁 Struktur Folder

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Grouped routes untuk authentication
│   │   ├── layout.jsx            # Auth layout
│   │   ├── login/
│   │   │   └── page.jsx          # Login page
│   │   ├── register/
│   │   │   └── page.jsx          # Register page
│   │   ├── forgot-password/
│   │   │   └── page.jsx          # Forgot password page
│   │   └── reset-password/
│   │       └── page.jsx          # Reset password page
│   ├── dashboard/
│   │   └── page.jsx              # Dashboard utama
│   ├── employee/
│   │   ├── clock/                # Clock in/out
│   │   ├── attendance-history/   # Riwayat kehadiran
│   │   ├── absences/             # Manajemen izin
│   │   ├── work-reports/         # Laporan kerja
│   │   └── face-registration/    # Registrasi wajah
│   ├── hr/
│   │   ├── employees/            # Manajemen karyawan
│   │   ├── attendances/          # Manajemen kehadiran
│   │   ├── absences/             # Persetujuan izin
│   │   ├── work-reports/         # Review laporan kerja
│   │   ├── assessments/          # Penilaian kinerja
│   │   ├── announcements/        # Pengumuman
│   │   └── public-holidays/      # Libur nasional
│   ├── leader/
│   │   └── admins/               # Manajemen admin
│   ├── profile/
│   │   └── page.jsx              # Profil pengguna
│   ├── layout.jsx                # Root layout
│   ├── page.jsx                  # Home (redirect ke login)
│   └── globals.css               # Global styles
│
├── components/                   # Reusable React Components
│   ├── auth/                     # Auth-related components
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── ForgotPasswordForm.jsx
│   ├── common/                   # Common components
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Footer.jsx
│   │   └── Loading.jsx
│   ├── dashboard/                # Dashboard components
│   │   ├── StatCard.jsx
│   │   ├── ChartWidget.jsx
│   │   └── RecentActivity.jsx
│   ├── employee/                 # Employee section components
│   │   ├── ClockInForm.jsx
│   │   ├── AbsenceForm.jsx
│   │   └── WorkReportForm.jsx
│   ├── hr/                       # HR section components
│   │   ├── EmployeeTable.jsx
│   │   ├── AttendanceTable.jsx
│   │   ├── ApprovalCard.jsx
│   │   └── ExportButton.jsx
│   ├── ui/                       # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Card.jsx
│   │   ├── Badge.jsx
│   │   └── Table.jsx
│   └── layout/                   # Layout components
│       ├── Header.jsx
│       ├── MainLayout.jsx
│       └── AuthLayout.jsx
│
├── services/                     # API Service Classes
│   ├── authService.js            # Authentication API
│   ├── employeeService.js        # Employee management API
│   ├── attendanceService.js      # Attendance API
│   ├── workReportService.js      # Work report API
│   └── absenceService.js         # Absence/leave API
│
├── hooks/                        # Custom React Hooks
│   ├── useAuth.js                # Authentication hook
│   ├── useUser.js                # User data hook
│   ├── useFetch.js               # Data fetching hook
│   └── useForm.js                # Form handling hook
│
├── lib/                          # Utility Functions & Constants
│   ├── constants.js              # App constants
│   ├── utils.js                  # Helper functions
│   ├── api.js                    # API configuration
│   └── validation.js             # Form validation
│
└── middleware.js                 # Next.js middleware (auth checks)

public/
├── images/                       # Image assets
│   └── logo.png
├── icons/                        # SVG icons
└── favicon.ico

.env.example                      # Environment variables template
.env.local                        # Local environment (git ignored)
.gitignore
jsconfig.json                     # JS path aliases
next.config.mjs                   # Next.js config
package.json
postcss.config.js                 # PostCSS config
tailwind.config.js                # Tailwind CSS config
prisma.config.ts                  # Prisma config (jika pakai)
README.md
```

## 🚀 Memulai

### Prerequisites
- Node.js 18+ 
- npm atau yarn

### Instalasi

1. Clone repository
```bash
git clone https://github.com/farizsalim/sebisaproject-absensi.git
cd sebisaproject-absensi
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env.local
# Edit .env.local dengan API URL yang sesuai
```

4. Run development server
```bash
npm run dev
```

5. Buka browser ke `http://localhost:3000`

## 📂 Panduan Struktur

### Services (`src/services/`)
Berisi class-class untuk API integration dengan backend Laravel:
- `authService.js` - Login, logout, register, reset password
- `employeeService.js` - CRUD employee data
- `attendanceService.js` - Clock in/out, attendance history
- `workReportService.js` - Work report management
- `absenceService.js` - Leave/absence request

**Contoh penggunaan:**
```javascript
import { AuthService } from '@/services/authService'

const handleLogin = async (email, password) => {
  const result = await AuthService.login(email, password)
  // Handle result
}
```

### Hooks (`src/hooks/`)
Custom React hooks untuk state management dan data fetching:
- `useAuth.js` - Manage authentication state
- `useUser.js` - Manage user data
- `useFetch.js` - Generic data fetching
- `useForm.js` - Form state management

**Contoh penggunaan:**
```javascript
import { useAuth } from '@/hooks/useAuth'

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth()
  
  if (!isAuthenticated) return <Redirect to="/login" />
  return <div>Welcome {user.name}</div>
}
```

### Components (`src/components/`)
Reusable React components organized by section:
- `auth/` - Login, register forms
- `common/` - Navbar, sidebar, footer
- `dashboard/` - Dashboard widgets
- `employee/` - Employee section components
- `hr/` - HR section components
- `ui/` - Reusable UI elements
- `layout/` - Layout wrapper components

### Lib (`src/lib/`)
Utility functions dan constants:
- `constants.js` - API endpoints, status values, roles
- `utils.js` - Date formatting, string manipulation, etc
- `api.js` - API configuration & interceptors
- `validation.js` - Form validation rules

## 🔐 Authentication Flow

1. User ke halaman login → `/login`
2. Submit email & password
3. `AuthService.login()` hit `/api/auth/login`
4. Backend return token + user data
5. Store di localStorage/session
6. Redirect ke dashboard
7. API calls include token di header Authorization

## 📋 API Integration

Semua API calls melalui service layer:

```javascript
// ✅ Correct way
import { EmployeeService } from '@/services/employeeService'
const employees = await EmployeeService.getEmployees()

// ❌ Wrong way - avoid direct fetch calls
const data = await fetch('/api/hr/employees')
```

## 🎨 Styling

Project menggunakan **Tailwind CSS** untuk styling:
- Configuration: `tailwind.config.js`
- Global styles: `src/app/globals.css`
- Component styles: inline className

## 🔄 Environment Variables

Lihat `.env.example` untuk list semua variables yang diperlukan:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=Sebisa Presensi
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📚 Dokumentasi Lebih Lanjut

Lihat file `Data Web.txt` untuk:
- Daftar semua halaman
- Route dan controller mapping dari backend Laravel
- Role-based access control

## 🤝 Contributing

1. Create feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit changes (`git commit -m 'Add AmazingFeature'`)
3. Push to branch (`git push origin feature/AmazingFeature`)
4. Open Pull Request

## 📝 License

Proprietary - Sebisa Project

---

**Last Updated:** 2026-07-30
