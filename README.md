# 🌟 Akshraa International
### *Delivering Quality Textiles Worldwide*

**Owner:** Rahul Pandey  
**Type:** Full-stack B2B Textile E-Commerce Platform  
**Stack:** React + Vite · Node.js + Express · MongoDB Atlas · Razorpay

---

## 📁 Project Structure

```
akshraa-international/
├── backend/                    ← Node.js + Express API
│   ├── config/
│   │   ├── db.js               ← MongoDB connection
│   │   └── cloudinary.js       ← Image upload config
│   ├── controllers/
│   │   ├── authController.js   ← Register, Login, Profile
│   │   ├── productController.js← Product CRUD + search
│   │   ├── orderController.js  ← Orders + Razorpay
│   │   └── userController.js   ← Admin: manage users
│   ├── middleware/
│   │   ├── auth.js             ← JWT protect + authorize
│   │   └── errorHandler.js     ← Global error handling
│   ├── models/
│   │   ├── User.js             ← User schema (buyer/seller/admin)
│   │   ├── Product.js          ← Product schema with surplus support
│   │   └── Order.js            ← Order + Razorpay payment schema
│   ├── routes/
│   │   ├── authRoutes.js       ← /api/auth/*
│   │   ├── productRoutes.js    ← /api/products/*
│   │   ├── orderRoutes.js      ← /api/orders/*
│   │   └── userRoutes.js       ← /api/users/*
│   ├── utils/
│   │   └── seeder.js           ← Database seed script
│   ├── server.js               ← Express app entry point
│   ├── .env.example            ← Environment variable template
│   └── render.yaml             ← Render deployment config
│
└── frontend/                   ← React + Vite + Tailwind
    ├── src/
    │   ├── api/                ← Axios API calls
    │   │   ├── axiosInstance.js← Configured axios with JWT
    │   │   ├── authApi.js
    │   │   ├── productApi.js
    │   │   ├── orderApi.js
    │   │   └── userApi.js
    │   ├── store/              ← Zustand global state
    │   │   ├── authStore.js    ← Auth state + actions
    │   │   └── cartStore.js    ← Cart with localStorage persist
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Navbar.jsx  ← Responsive nav with cart badge
    │   │   │   └── Footer.jsx
    │   │   ├── common/
    │   │   │   ├── LoadingSpinner.jsx
    │   │   │   ├── StarRating.jsx
    │   │   │   └── ProtectedRoute.jsx
    │   │   └── product/
    │   │       └── ProductCard.jsx ← Product tile with surplus badge
    │   ├── pages/
    │   │   ├── HomePage.jsx        ← Hero + categories + featured + surplus
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx    ← Buyer/Seller registration
    │   │   ├── ProductsPage.jsx    ← Listing with filters + pagination
    │   │   ├── ProductDetailPage.jsx← Product detail + add to cart
    │   │   ├── CartPage.jsx        ← Cart + Razorpay checkout
    │   │   ├── OrdersPage.jsx      ← Order history
    │   │   ├── seller/
    │   │   │   ├── SellerDashboard.jsx ← Manage products + stats
    │   │   │   └── ProductForm.jsx     ← Add/edit product with images
    │   │   └── admin/
    │   │       └── AdminPanel.jsx      ← Users, sellers, orders
    │   ├── App.jsx             ← React Router configuration
    │   └── index.css           ← Tailwind + custom styles
    ├── vercel.json             ← Vercel SPA routing fix
    └── .env.example
```

---

## 🗄️ Database Schema

### User
| Field | Type | Notes |
|-------|------|-------|
| name | String | Required |
| email | String | Unique, required |
| password | String | Hashed (bcrypt) |
| role | Enum | `buyer` / `seller` / `admin` |
| isApproved | Boolean | Sellers need admin approval |
| businessName | String | For B2B identification |
| gstNumber | String | GST for Indian businesses |
| phone, businessAddress | Mixed | Contact info |

### Product
| Field | Type | Notes |
|-------|------|-------|
| name, description | String | Required |
| category | Enum | `Home Textiles` / `Apparel` / `Surplus Materials` |
| subCategory | Enum | Placemats, Kurtas, Threads, etc. |
| price | Number | Base price per unit |
| discountedPrice | Number | For surplus deals |
| moq | Number | Minimum Order Quantity (B2B) |
| unit | Enum | pieces/meters/kg/dozen/set |
| stockType | Enum | `Regular` / `Surplus` |
| countInStock | Number | Available stock |
| images | Array | Cloudinary URLs |
| specifications | Object | material, dimensions, weight, etc. |
| isFeatured, isSurplusDeal | Boolean | Homepage sections |
| seller | ObjectId | Ref to User |

### Order
| Field | Type | Notes |
|-------|------|-------|
| buyer | ObjectId | Ref to User |
| orderItems | Array | Product snapshots at order time |
| shippingAddress | Object | Full delivery address |
| itemsPrice, taxPrice, shippingPrice, totalPrice | Number | Price breakdown |
| paymentMethod | Enum | `razorpay` / `bank_transfer` / `cod` |
| paymentResult | Object | Razorpay IDs + signature |
| isPaid, isDelivered | Boolean | Payment/delivery flags |
| status | Enum | pending→confirmed→processing→shipped→delivered |
| invoiceNumber | String | Auto-generated AKS-YEAR-XXXXXX |

---

## 🚀 Local Setup Guide

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (free tier)
- Razorpay test account

### Step 1: Clone & Setup

```bash
git clone https://github.com/yourusername/akshraa-international.git
cd akshraa-international
```

### Step 2: Backend Setup

```bash
cd backend
npm install

# Create .env file from template
cp .env.example .env
# Edit .env with your actual values
nano .env
```

**Fill in your `.env`:**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/akshraa_db
JWT_SECRET=your_long_random_secret_at_least_32_chars
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

**Seed the database with sample data:**
```bash
npm run seed
```

**Start backend:**
```bash
npm run dev
# Server runs at: http://localhost:5000
```

### Step 3: Frontend Setup

```bash
cd ../frontend
npm install

# Create .env file
cp .env.example .env
# Edit with your values:
# VITE_API_URL=http://localhost:5000/api
# VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx

npm run dev
# Frontend runs at: http://localhost:5173
```

### Step 4: Test Login

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@akshraa.com | Admin@123456 |
| Seller | rahul@akshraa.com | Seller@123 |
| Buyer | buyer@example.com | Buyer@123 |

---

## 🌐 Deployment Guide

### MongoDB Atlas Setup
1. Create account at https://cloud.mongodb.com
2. Create a new cluster (M0 free tier)
3. Create database user with read/write permissions
4. Whitelist all IPs (0.0.0.0/0) for cloud deployment
5. Copy connection string to `MONGO_URI` in .env

### Backend → Render.com
1. Push code to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add all environment variables from `.env.example`
6. Click Deploy
7. Note your Render URL (e.g., `https://akshraa-api.onrender.com`)

### Frontend → Vercel
1. Push code to GitHub
2. Go to https://vercel.com → New Project
3. Import your GitHub repo
4. Set:
   - **Root Directory:** `frontend`
   - **Framework:** Vite
5. Add environment variables:
   - `VITE_API_URL` = `https://your-render-url.onrender.com/api`
   - `VITE_RAZORPAY_KEY_ID` = your Razorpay key
6. Click Deploy
7. Note your Vercel URL
8. Update backend `CLIENT_URL` on Render with your Vercel URL

### Post-Deployment
1. Update backend `CLIENT_URL` env var to your Vercel URL
2. Run seeder on production (optional):
   ```bash
   # Set MONGO_URI to production Atlas URI then run:
   node utils/seeder.js
   ```

---

## 📡 API Reference

### Auth
```
POST /api/auth/register    Body: { name, email, password, role, businessName }
POST /api/auth/login       Body: { email, password }
GET  /api/auth/me          Header: Authorization: Bearer <token>
PUT  /api/auth/updateprofile
PUT  /api/auth/changepassword
```

### Products
```
GET  /api/products         ?keyword=cotton&category=Home Textiles&stockType=Surplus&page=1
GET  /api/products/featured
GET  /api/products/surplus-deals
GET  /api/products/:id
POST /api/products         (Seller/Admin) FormData with images
PUT  /api/products/:id     (Owner Seller/Admin)
DELETE /api/products/:id   (Owner Seller/Admin)
POST /api/products/:id/reviews
```

### Orders
```
POST /api/orders           Creates order + Razorpay order
POST /api/orders/:id/verify-payment
GET  /api/orders/myorders
GET  /api/orders/:id
GET  /api/orders           (Admin only)
PUT  /api/orders/:id/status (Admin only)
```

### Users (Admin)
```
GET  /api/users
GET  /api/users/sellers/pending
GET  /api/users/seller/dashboard
GET  /api/users/admin/stats
PUT  /api/users/:id/approve
PUT  /api/users/:id/activate
DELETE /api/users/:id
```

---

## 🎨 Design System

- **Primary Color:** `#1a3a6b` (Dark Navy Blue)
- **Accent Color:** `#f5c438` (Gold)
- **Background:** `#f9fafb` (Light Gray)
- **Font (Headings):** Playfair Display (serif)
- **Font (Body):** Inter (sans-serif)

---

## ✅ Features Implemented

- [x] JWT Authentication (Buyer/Seller/Admin roles)
- [x] Password hashing with bcrypt
- [x] Product CRUD with Cloudinary image uploads
- [x] Product categories: Home Textiles, Apparel, Surplus Materials
- [x] Surplus Deals section (highlighted)
- [x] Full-text product search + filters
- [x] Cart with MOQ validation
- [x] Razorpay payment integration
- [x] Order management with status tracking
- [x] Seller dashboard + product management
- [x] Admin panel: manage users, approve sellers, track orders
- [x] Fully responsive (mobile + desktop)
- [x] Rate limiting + Helmet security headers
- [x] Auto-generated invoice numbers

## 🚧 Optional Enhancements (Next Steps)

- [ ] AI product recommendations (based on order history)
- [ ] Smart search with autocomplete
- [ ] Email notifications (order confirmation, shipping)
- [ ] PDF invoice generation
- [ ] Bulk CSV product import
- [ ] WhatsApp chat integration

---

*Built with ❤️ for Rahul Pandey & Akshraa International*
