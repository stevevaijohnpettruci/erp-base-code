# ERP Base Code — Frontend

Frontend ERP sederhana berbasis **React + TypeScript + Vite + Tailwind CSS + shadcn/ui**.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v3 + shadcn/ui components
- **Routing**: React Router DOM v7
- **State Management**: Zustand (dengan persist ke localStorage)
- **HTTP Client**: Axios (dengan auto-refresh token interceptor)
- **Server State**: TanStack React Query

## Halaman

| Halaman | Route | Keterangan |
|---|---|---|
| Login | `/login` | Email/password + Google One Tap |
| Dashboard | `/dashboard` | Stat cards + account info |

## Struktur Folder

```
src/
├── components/
│   ├── layout/       # DashboardLayout, Sidebar
│   └── ui/           # shadcn components (Button, Card, Input, dll)
├── lib/
│   ├── axios.ts      # Axios instance + interceptor
│   └── utils.ts      # cn() helper
├── pages/
│   ├── auth/         # LoginPage
│   └── dashboard/    # DashboardPage
├── store/
│   └── auth-store.ts # Zustand auth store
└── types/
```

---

## Setup

### Prasyarat

- Node.js 20+
- Backend sudah berjalan di `http://localhost:3000` (lihat README backend)

### 1. Install Dependencies

```bash
npm install
```

### 2. Konfigurasi Environment

```bash
cp .env.example .env
```

Isi variabel berikut di `.env`:

| Variabel | Keterangan |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Client ID dari Google Cloud Console (opsional, untuk Google login) |

---

## Running

### Development

```bash
npm run dev
# → http://localhost:5173
```

Request ke `/api/*` otomatis di-proxy ke `http://localhost:3000`.

### Production Build

```bash
npm run build
npm run preview
```

---

## Scripts

| Script | Keterangan |
|---|---|
| `npm run dev` | Jalankan dev server dengan HMR |
| `npm run build` | Build untuk production |
| `npm run preview` | Preview hasil build production |

---

## Auth Flow

1. User login via email/password → `POST /api/v1/auth`
2. User login via Google → Google One Tap → `POST /api/v1/auth/google`
3. Access token disimpan di Zustand store (persist localStorage)
4. Setiap request otomatis menyertakan `Authorization: Bearer <token>`
5. Jika access token expired (401), axios interceptor otomatis hit `PUT /api/v1/auth` untuk refresh
6. Jika refresh gagal, user di-redirect ke `/login`
