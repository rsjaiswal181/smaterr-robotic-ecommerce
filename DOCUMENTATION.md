# Smaterr Roboticz — Ecommerce Platform

A full-stack ecommerce MVP: React + TypeScript storefront, a role-protected admin panel, and a
Node/Express/MongoDB API. Cash on Delivery is the only payment method wired up in this build (by
request) — the code is structured so Razorpay/Stripe can be dropped into `backend/src/controllers/order.controller.ts`
and the checkout page later without restructuring anything.

---

## 1. What's included

| Layer      | Stack                                                                 |
|------------|------------------------------------------------------------------------|
| Frontend   | React 19, Vite, TypeScript, Tailwind CSS v4, TanStack Query, React Router, React Hook Form + Zod, Framer Motion, Zustand |
| Backend    | Node.js, Express, TypeScript, MongoDB/Mongoose, JWT (access + refresh), Multer, Winston, Helmet, express-rate-limit |
| Storage    | Local disk (`backend/uploads`) by default; swaps to Cloudinary automatically if you add credentials |
| Email      | Logged to the backend console in dev; swaps to real SMTP automatically if you add credentials |
| Database   | MongoDB (local or Atlas) |

**Implemented:** product catalog with categories/brands, search + filters + sort + pagination, cart,
coupons, checkout (COD), order lifecycle (pending → delivered, with cancellation), JWT auth with
refresh tokens, wishlist, addresses, product reviews & ratings, admin dashboard with charts, and
full admin CRUD for products/categories/brands/orders/customers/coupons.

**Not implemented in this pass** (left as clean extension points): Razorpay/Stripe, Redis caching,
Google/GitHub OAuth, blogs/FAQs/testimonials CMS, WhatsApp/Analytics/Pixel integrations, CSV bulk
import, invoice PDF/barcode generation. The architecture (service layer, controllers, typed API
client) is set up so any of these can be added without a rewrite.

---

## 2. Prerequisites

- **Node.js 18+** and npm (check with `node -v`)
- **MongoDB** — either:
  - **Local**: install MongoDB Community Server and have `mongod` running, OR
  - **Atlas** (no local install): create a free cluster at https://www.mongodb.com/cloud/atlas and
    copy its connection string

### Installing MongoDB locally

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
Download the installer from https://www.mongodb.com/try/download/community, run it (choose "Install as a Service"), then MongoDB starts automatically. Confirm with:
```powershell
mongosh
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

Verify it's running:
```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```

**Or skip all of the above** and use MongoDB Atlas — sign up, create a free (M0) cluster, add your
IP to the access list, create a database user, and copy the connection string (looks like
`mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/ecommerce`). Paste it into
`backend/.env` as `MONGO_URI`.

---

## 3. Install & run — single command path

From the project root (the folder containing this file):

```bash
npm run setup   # installs backend + frontend deps, then seeds the database
npm run dev     # starts backend (port 5000) and frontend (port 5173) together
```

That's it. `npm run setup` runs `npm install` in both `backend/` and `frontend/`, then runs the
database seed script (creates an admin user, sample categories/brands/products, and a sample
coupon). `npm run dev` runs both servers concurrently in one terminal.

> The backend works with **zero configuration** — if you don't create a `backend/.env` file, it
> falls back to `mongodb://127.0.0.1:27017/ecommerce` and dev-only JWT secrets. This is fine for
> trying the project locally, but **create a real `.env` before doing anything beyond local testing**
> (see section 4).

If `npm run setup` fails at the seed step, it's almost always because MongoDB isn't running yet —
start it (section 2), then just run `npm run seed` again.

---

## 4. Manual / step-by-step setup

If you'd rather run things individually or need to customize environment variables first:

```bash
# 1. Backend env
cd backend
cp .env.example .env
# Edit .env if you want to: point MONGO_URI at Atlas, add Cloudinary/SMTP creds, change
# ADMIN_EMAIL / ADMIN_PASSWORD before seeding, etc. Defaults work for local testing as-is.
npm install

# 2. Frontend env
cd ../frontend
cp .env.example .env
# Only needed if your backend isn't on the default http://localhost:5000
npm install

# 3. Seed the database (creates the admin user + sample data)
cd ../backend
npm run seed

# 4. Run both servers (two terminals)
# Terminal A:
cd backend && npm run dev
# Terminal B:
cd frontend && npm run dev
```

---

## 5. URLs & default credentials

| What | URL |
|---|---|
| Storefront (frontend) | http://localhost:5173 |
| Admin panel login | http://localhost:5173/admin/login |
| Backend API base path | http://localhost:5000/api |
| Backend health check | http://localhost:5000/health |

**Default seeded admin login:**
- Email: `admin@example.com`
- Password: `Admin@123`

(Change `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env` **before** running `npm run seed` if you
want different credentials — the seed script won't overwrite an existing admin account, so if you
change them after seeding once, delete the existing admin user from MongoDB first or seed against a
fresh database.)

A sample coupon code `WELCOME10` (10% off, ₹500 minimum) is also seeded for testing checkout.

---

## 6. Project structure

```
ecommerce/
├── package.json              # root convenience scripts (setup/dev/build)
├── backend/
│   ├── src/
│   │   ├── config/           # env, db connection, logger, cloudinary
│   │   ├── controllers/      # request handlers per resource
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express routers, mounted in routes/index.ts
│   │   ├── middleware/       # auth, error handling, rate limiting, uploads
│   │   ├── services/         # token, email, upload abstraction
│   │   ├── validators/       # express-validator rules
│   │   ├── utils/            # ApiError, ApiResponse, asyncHandler, seed script
│   │   ├── app.ts            # Express app (middleware + route mounting)
│   │   └── server.ts         # entrypoint — connects DB, starts listener
│   ├── uploads/               # local file storage (used when Cloudinary isn't configured)
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/             # public storefront pages
    │   ├── pages/admin/       # admin panel pages
    │   ├── components/        # ui/ (primitives), layout/, common/, admin/
    │   ├── services/          # typed Axios API clients
    │   ├── store/              # Zustand stores (auth, toast)
    │   ├── hooks/               # useAuth, useCart
    │   ├── routes/guards.tsx   # RequireAuth / RequireAdmin / RedirectIfAuthed
    │   └── types/               # shared TypeScript types
    └── .env.example
```

---

## 7. API overview

All endpoints are prefixed with `/api`. Full route list:

```
POST   /auth/register              POST   /auth/login              POST   /auth/admin/login
POST   /auth/refresh                POST   /auth/logout             GET    /auth/me
POST   /auth/forgot-password        POST   /auth/reset-password

GET    /categories                  GET    /categories/:slug
POST   /categories (admin)          PUT    /categories/:id (admin)  DELETE /categories/:id (admin)

GET    /brands                      POST   /brands (admin)          PUT/DELETE /brands/:id (admin)

GET    /products                    GET    /products/slug/:slug     GET /products/search/suggestions
POST   /products (admin)            PUT/DELETE /products/:id (admin)

GET    /cart                        POST   /cart/items              PUT/DELETE /cart/items/:productId
POST   /cart/coupon                 DELETE /cart

POST   /orders                      GET    /orders/my-orders        GET /orders/:id
PUT    /orders/:id/cancel           GET    /orders (admin)          PUT /orders/:id/status (admin)

GET/POST/PUT/DELETE /coupons (admin only)
GET    /reviews/product/:productId  POST /reviews/product/:productId  DELETE /reviews/:id (admin)

PUT    /users/profile               POST/PUT/DELETE /users/addresses
GET/POST /users/wishlist            GET /users (admin)               PUT /users/:id/toggle-status (admin)

POST   /upload/single (admin)       POST /upload/multiple (admin)
GET    /admin/dashboard/stats (admin)
```

Auth uses a short-lived JWT access token (returned in the response body, sent as
`Authorization: Bearer <token>`) plus a long-lived refresh token stored in an httpOnly cookie. The
frontend's Axios client automatically retries a request once with a refreshed token on a 401.

---

## 8. Deployment (when you're ready)

The original spec targets Vercel (frontend) + Render (backend) + MongoDB Atlas (database). Rough steps:

1. **MongoDB Atlas**: create a cluster, get the connection string, allow access from Render's IPs (or `0.0.0.0/0` for simplicity).
2. **Render (backend)**: new Web Service → point at `backend/`, build command `npm install && npm run build`, start command `npm start`, add all vars from `.env.example` (with real secrets), set `CLIENT_URL` to your deployed frontend URL.
3. **Vercel (frontend)**: import `frontend/`, set `VITE_API_BASE_URL` to your deployed backend URL + `/api`.
4. Update backend `CORS` origin (`CLIENT_URL` env var) to the deployed frontend URL, and the frontend `.env` to the deployed backend URL.
5. If you enable Cloudinary/SMTP/Razorpay/Stripe, add those credentials as environment variables on Render — never commit them.

---

## 9. Troubleshooting

- **"MongoDB connection failed" / seed script hangs** → MongoDB isn't running. Start it (section 2) or check your Atlas connection string and IP allowlist.
- **CORS errors in the browser console** → Check `CLIENT_URL` in `backend/.env` matches the exact frontend URL (including port).
- **Images don't upload** → Without Cloudinary credentials, uploads save to `backend/uploads/` and are served at `http://localhost:5000/uploads/<filename>` — this works out of the box, no setup needed for local testing.
- **Password reset / order emails don't arrive** → Without SMTP credentials configured, emails are logged to the backend terminal instead of sent — check there.
- **Port already in use** → Change `PORT` in `backend/.env`, or the frontend port via `vite.config.ts`'s `server.port`.
