# ERP Base Code — Backend

Backend REST API untuk ERP sederhana berbasis **Node.js + Express + Prisma ORM + PostgreSQL + Redis**.

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express 5
- **ORM**: Prisma 5 (PostgreSQL)
- **Auth**: JWT (access + refresh token) + Google OAuth (ID Token manual verification)
- **Cache/Session**: Redis (refresh token storage)
- **Validation**: Joi
- **Logger**: Winston

## Struktur Modul

| Modul | Endpoint |
|---|---|
| Auth | `POST /api/v1/auth` |
| Google OAuth | `POST /api/v1/auth/google` |
| Users | `GET/POST/PUT /api/v1/users` |
| Departments | `GET/POST/PUT/DELETE /api/v1/departments` |
| Employees | `GET/POST/PUT /api/v1/employees` |
| Products | `GET/POST/PUT/DELETE /api/v1/products` |
| Inventory | `GET/POST /api/v1/inventory` |
| Orders | `GET/POST/PUT /api/v1/orders` |

---

## Setup

### Prasyarat

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- Node.js 20+ (untuk dev lokal)

### 1. Clone & Install

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
| `DATABASE_URL` | Otomatis di-set docker-compose, tidak perlu diubah untuk dev |
| `ACCESS_TOKEN_KEY` | Secret JWT access token (min. 32 karakter) |
| `REFRESH_TOKEN_KEY` | Secret JWT refresh token (min. 32 karakter) |
| `GOOGLE_CLIENT_ID` | Client ID dari Google Cloud Console |
| `ALLOWED_ORIGINS` | Origin frontend yang diizinkan CORS |

### 3. Jalankan Database & Redis via Docker

> Pastikan tidak ada PostgreSQL/Redis lokal yang berjalan di port yang sama.
> Jika ada, stop dulu: `sudo systemctl stop postgresql redis`

```bash
docker compose up -d db redis
```

### 4. Migrate Database

```bash
npx prisma migrate dev --name init
```

### 5. Seed Roles & Permissions

```bash
npm run db:seed
```

Seed akan membuat 4 role default:

| Role | Akses |
|---|---|
| `superadmin` | Semua permission |
| `admin` | Semua permission |
| `manager` | read, create, update semua resource |
| `staff` | read only |

---

## Running

### Development (hot reload)

```bash
npm run start:dev
```

### Production (via Docker)

```bash
docker compose up -d --build
```

### Jalankan semua sekaligus (db + redis + app)

```bash
docker compose up -d
```

---

## Scripts

| Script | Keterangan |
|---|---|
| `npm run start:dev` | Jalankan dengan nodemon (hot reload) |
| `npm run start:prod` | Jalankan production build |
| `npm run db:migrate` | Jalankan Prisma migration |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:studio` | Buka Prisma Studio (GUI database) |
| `npm run db:seed` | Seed roles & permissions |
| `npm run lint` | Jalankan ESLint |

---

## RBAC

Setiap endpoint (kecuali register & login) dilindungi oleh:
1. `authenticateToken` — validasi JWT access token
2. `authorize(action, resource)` — cek permission berdasarkan role user

Contoh: `authorize('read', 'products')` → hanya user dengan permission `read:products` yang bisa akses.
