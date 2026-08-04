import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sebisa Project Absensi",
  description: "Sistem manajemen presensi dan kehadiran karyawan Sebisa Project",
  applicationName: "Sebisa Project Absensi",
  keywords: [
    "absensi karyawan",
    "presensi karyawan",
    "manajemen kehadiran",
    "Sebisa Project",
  ],
  authors: [{ name: "Sebisa Project" }],
  creator: "Sebisa Project",
  publisher: "Sebisa Project",
  category: "business",
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "Sebisa Project Absensi",
    description: "Sistem manajemen presensi dan kehadiran karyawan Sebisa Project",
    type: "website",
    locale: "id_ID",
    siteName: "Sebisa Project Absensi",
    images: [{ url: "/images/logo.png", width: 512, height: 512, alt: "Logo Sebisa Project Absensi" }],
  },
  twitter: {
    card: "summary",
    title: "Sebisa Project Absensi",
    description: "Sistem manajemen presensi dan kehadiran karyawan Sebisa Project",
    images: ["/images/logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
