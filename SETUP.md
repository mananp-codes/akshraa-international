# ⚡ Quick Setup Guide — Akshraa International

## Prerequisites
| Tool | Min Version | Download |
|------|-------------|---------|
| Node.js | 18.x+ | https://nodejs.org |
| npm | 9.x+ | (comes with Node.js) |
| Git | any | https://git-scm.com |

---

## 📦 Step 1 — Install Dependencies

```bash
# From project root:
cd backend  && npm install
cd ../frontend && npm install
```

---

## 🔑 Step 2 — Configure Environment Variables

### Backend (`backend/.env`)
Open `backend/.env` and fill in:

| Variable | Where to get it |
|----------|----------------|
| `MONGO_URI` | https://cloud.mongodb.com → Connect → Drivers |
| `JWT_SECRET` | Any random 32+ char string |
| `CLOUDINARY_CLOUD_NAME` | https://cloudinary.com/console |
| `CLOUDINARY_API_KEY` | https://cloudinary.com/console |
| `CLOUDINARY_API_SECRET` | https://cloudinary.com/console |
| `RAZORPAY_KEY_ID` | https://dashboard.razorpay.com/app/keys |
| `RAZORPAY_KEY_SECRET` | https://dashboard.razorpay.com/app/keys |
| `CLIENT_URL` | `http://localhost:5173` (for local dev) |

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
```

---

## 🌱 Step 3 — Seed Sample Data

```bash
cd backend
npm run seed
```

This creates:
- 1 Admin account: `admin@akshraa.com` / `Admin@123456`
- 1 Seller account: `rahul@akshraa.com` / `Seller@123`
- 1 Buyer account: `buyer@example.com` / `Buyer@123`
- 8 sample products (placemats, quilts, threads, fabric, etc.)

---

## 🚀 Step 4 — Start Both Servers

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# ✅ Backend: http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# ✅ Frontend: http://localhost:5173
```

Open your browser → http://localhost:5173

---

## 🧪 Test Accounts

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | admin@akshraa.com | Admin@123456 | Everything |
| **Seller** | rahul@akshraa.com | Seller@123 | Seller Dashboard |
| **Buyer** | buyer@example.com | Buyer@123 | Shop + Orders |

---

## 🔗 API Endpoints (Backend at :5000)

```
GET  /health                          → Server health check
POST /api/auth/register               → Create account
POST /api/auth/login                  → Login
GET  /api/auth/me                     → Current user

GET  /api/products                    → All products (+ filters)
GET  /api/products/featured           → Featured products
GET  /api/products/surplus-deals      → Surplus deals
GET  /api/products/:id                → Product detail
POST /api/products                    → Create product (seller)
PUT  /api/products/:id                → Update product
DELETE /api/products/:id              → Delete product

POST /api/orders                      → Create order + Razorpay
POST /api/orders/:id/verify-payment   → Verify Razorpay payment
GET  /api/orders/myorders             → My orders
GET  /api/orders/:id                  → Order detail

GET  /api/users                       → All users (admin)
PUT  /api/users/:id/approve           → Approve seller (admin)
GET  /api/users/admin/stats           → Platform stats (admin)
GET  /api/users/seller/dashboard      → Seller stats
```

---

## 🌐 Deployment

### Backend → Render.com (Free)
1. Push to GitHub
2. render.com → New Web Service
3. Root dir: `backend`, Build: `npm install`, Start: `npm start`
4. Add all `.env` variables in Render dashboard
5. Copy Render URL (e.g. `https://akshraa-api.onrender.com`)

### Frontend → Vercel (Free)
1. Push to GitHub
2. vercel.com → New Project → Import repo
3. Root dir: `frontend`, Framework: Vite
4. Add env vars: `VITE_API_URL=https://your-render-url.onrender.com/api`
5. Deploy → get your Vercel URL

### Update CORS
After Vercel deploy, update `CLIENT_URL` in Render env vars to your Vercel URL.

---

## 📁 Folder Structure

```
akshraa-international/
├── backend/           ← Node.js + Express + MongoDB
│   ├── config/        ← DB, Cloudinary setup
│   ├── controllers/   ← Business logic
│   ├── middleware/    ← Auth, Error handler
│   ├── models/        ← MongoDB schemas
│   ├── routes/        ← API routes
│   ├── utils/         ← Seeder
│   └── server.js      ← Entry point
│
├── frontend/          ← React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/       ← Axios API calls
│   │   ├── store/     ← Zustand state (auth + cart)
│   │   ├── components/← Navbar, Footer, Cards
│   │   └── pages/     ← All page components
│   └── vite.config.js
│
├── README.md          ← Full documentation
└── SETUP.md           ← This file
```

---

*Need help? Contact Rahul Pandey — rahul@akshraa.com*
