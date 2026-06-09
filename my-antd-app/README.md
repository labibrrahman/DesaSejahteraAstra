# Desa Sejahtera Astra - Website Pendaftaran

Platform digital untuk mengelola proses pendaftaran dan penilaian program Desa Sejahtera Astra.

## Tech Stack

- **Frontend:** React.js + Ant Design
- **Backend:** Lumen (Laravel) - RESTful API
- **Database:** MySQL
- **Auth Peserta:** Google OAuth 2.0
- **Auth Admin/Juri:** Username & Password (JWT)

## Fitur

### 🏠 Landing Page (Public)
- Hero section dengan informasi program
- 4 Pilar Pembangunan (Ekonomi, Sosial, Lingkungan, Infrastruktur)
- Statistik program
- Tombol Daftar/Login

### 👤 Peserta
- **Login:** Google OAuth
- **Form Pendaftaran (4 Section):**
  1. Pilih Pilar & Kategori
  2. Identitas Desa/Kelompok
  3. Data Program (Grup Astra, Latar Belakang, Dampak)
  4. Review & Submit
- **Dashboard:** Status pendaftaran, progress tracking

### 👨‍⚖️ Juri
- **Login:** Username & Password
- **Daftar Peserta:** Filter dan cari peserta yang siap dinilai
- **Form Penilaian:** 3 kriteria (0-100), total maks 300, catatan
- **Riwayat Penilaian:** Daftar penilaian yang telah dilakukan

### 🔧 Admin
- **Login:** Username & Password
- **Dashboard:** Statistik pendaftaran, grafik pilar
- **Daftar Peserta:** Filter, cari, detail peserta
- **Riwayat Penilaian:** Semua penilaian dari juri
- **Data Master:**
  - Pilar
  - Kategori
  - User (Admin/Juri)
  - Wilayah (Provinsi/Kabupaten/Kecamatan/Desa)
  - Grup Astra

## Status Peserta

| Kode | Label | Keterangan |
|------|-------|------------|
| 1 | Draft | Form sedang diisi |
| 2 | Menunggu Screening | Sudah submit |
| 3 | Sedang Dinilai | Dikerjakan juri |
| 4 | Selesai Dinilai | Penilaian selesai |
| 5 | Finalis | Tahap final |

## Instalasi

```bash
# Clone repository
git clone <repository-url>

# Install dependencies
npm install

# Jalankan development server
npm start
```

## Struktur Folder

```
src/
├── components/
│   └── layouts/
│       ├── AdminLayout.js
│       ├── JuriLayout.js
│       └── PesertaLayout.js
├── pages/
│   ├── public/
│   │   ├── LandingPage.js
│   │   └── Login.js
│   ├── peserta/
│   │   ├── FormPendaftaran.js
│   │   └── PesertaDashboard.js
│   ├── admin/
│   │   ├── AdminDashboard.js
│   │   ├── AdminPesertaList.js
│   │   ├── AdminPenilaianHistory.js
│   │   ├── MasterPilar.js
│   │   ├── MasterKategori.js
│   │   ├── MasterUser.js
│   │   ├── MasterWilayah.js
│   │   └── MasterGrupAstra.js
│   └── juri/
│       ├── JuriPesertaList.js
│       ├── JuriFormPenilaian.js
│       └── JuriPenilaianHistory.js
├── App.js
└── App.css
```

## Routes

| Path | Halaman | Role |
|------|---------|------|
| `/` | Landing Page | Public |
| `/login` | Login Peserta | Public |
| `/login/admin` | Login Admin | Public |
| `/login/juri` | Login Juri | Public |
| `/peserta/dashboard` | Dashboard Peserta | Peserta |
| `/peserta/pendaftaran` | Form Pendaftaran | Peserta |
| `/admin/dashboard` | Dashboard Admin | Admin |
| `/admin/peserta` | Daftar Peserta | Admin |
| `/admin/penilaian` | Riwayat Penilaian | Admin |
| `/admin/master/*` | Data Master | Admin |
| `/juri/peserta` | Daftar Peserta | Juri |
| `/juri/penilaian/:id` | Form Penilaian | Juri |
| `/juri/riwayat` | Riwayat Penilaian | Juri |

## Pengembangan Selanjutnya

- [ ] Integrasi API Backend (Lumen)
- [ ] Implementasi Google OAuth
- [ ] Implementasi JWT Authentication
- [ ] Responsive design untuk mobile
- [ ] Export data ke Excel/PDF
- [ ] Notifikasi real-time
- [ ] Upload dokumen pendukung