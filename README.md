# 🍽️ Zaiqa — Restaurant Management System

A full-stack restaurant ordering, reservation, and management platform — built as a commission-free alternative to third-party food delivery apps. Customers can browse the menu, place dine-in/takeaway/delivery orders, book tables, and track orders in real time. Restaurant owners get a full admin dashboard to manage orders, menu, reservations, and sales analytics.


---

## ✨ Features

**Customer-facing**
- Browse menu by category with search & filters
- Cart + checkout with dine-in / takeaway / delivery options
- Real-time order status tracking (Socket.io)
- Table reservation with availability check
- Order history, reviews & ratings

**Admin Dashboard**
- Live order feed with status management
- Menu & inventory management (CRUD + image upload)
- Reservation calendar & approval
- Sales analytics (revenue trends, top-selling items, order distribution)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), Tailwind CSS, Zustand, Recharts |
| Backend | Node.js, Express, Socket.io |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcrypt |
| Image storage | Cloudinary |
| Payments | Stripe *(planned)* |
| Deployment | Vercel (frontend) · Railway/Render (backend + DB) |
| Containerization | Docker + Docker Compose |

---

## 📁 Project Structure

```
zaiqa/
├── backend/                 # Express API
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── sockets/
│   │   └── server.js
│   └── Dockerfile
├── frontend/                 # Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── (customer)/
│   │   │   └── admin/
│   │   ├── components/
│   │   ├── store/
│   │   └── lib/
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- Docker Desktop (for PostgreSQL)

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/zaiqa.git
cd zaiqa
```

### 2. Start the database
```bash
docker run --name zaiqa-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=zaiqa_db \
  -p 5432:5432 -d postgres:15-alpine
```

### 3. Backend setup
```bash
cd backend
npm install
cp .env.example .env      # fill in your values
npx prisma migrate dev --name init
npm run dev                # runs on http://localhost:5000
```

### 4. Frontend setup
```bash
cd ../frontend
npm install
cp .env.example .env.local
npm run dev                # runs on http://localhost:3000
```

---

## 🔑 Environment Variables

**`backend/.env`**
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/zaiqa_db"
JWT_SECRET="your_secret_key"
PORT=5000
```

**`frontend/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/menu` | Get all categories + items |
| POST | `/api/orders` | Place an order |
| PATCH | `/api/orders/:id/status` | Update order status (admin) |
| POST | `/api/reservations` | Book a table |
| GET | `/api/admin/analytics/sales` | Sales data (admin) |

---

## 🐳 Running with Docker Compose (full stack)

```bash
docker-compose up --build
```
This spins up PostgreSQL, backend, and frontend together.


---

