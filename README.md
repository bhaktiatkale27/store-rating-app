# StoreRate — Full Stack Rating Platform

A complete full-stack web application for store ratings with role-based access control.

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MySQL
- **Frontend**: React.js
- **Auth**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

---

## Prerequisites

Make sure you have these installed:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v16+ | https://nodejs.org |
| npm | v8+ | (comes with Node.js) |
| MySQL | v8.0+ | https://dev.mysql.com/downloads/ |

---

## Quick Setup Guide

### Step 1 — Clone / Extract the Project

If you downloaded the ZIP, extract it. You should have:
```
store-rating-app/
  backend/
  frontend/
```

---

### Step 2 — Set Up MySQL

1. Open MySQL Workbench or your MySQL client
2. Make sure MySQL server is running
3. You just need a running MySQL server — the app will **auto-create the database and tables**

---

### Step 3 — Configure Backend Environment

```bash
cd store-rating-app/backend
cp .env.example .env
```

Open `.env` and update your MySQL credentials:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=store_rating_db
JWT_SECRET=change_this_to_a_random_secret_string
JWT_EXPIRES_IN=7d
```

> ⚠️ Replace `your_mysql_password_here` with your actual MySQL root password.

---

### Step 4 — Install Backend Dependencies

```bash
cd store-rating-app/backend
npm install
```

---

### Step 5 — Start the Backend Server

```bash
npm run dev
```

You should see:
```
✅ Database initialized successfully
✅ Default admin created: admin@storerating.com / Admin@123
🚀 Server running on http://localhost:5000
```

> The server auto-creates the database, tables, and a default admin user on first run.

---

### Step 6 — Install Frontend Dependencies

Open a **new terminal**:

```bash
cd store-rating-app/frontend
npm install
```

---

### Step 7 — Start the Frontend

```bash
npm start
```

This opens the app at **http://localhost:3000**

---

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@storerating.com | Admin@123 |

> Normal users can register via the Sign Up page.
> Store Owners are created by the Admin.

---

## User Roles & Access

### 🔴 System Administrator
- Dashboard: view total users, stores, and ratings
- Add users (normal user, admin, store owner)
- Add stores and assign to store owners
- View/filter all users and stores with sorting
- View user details (store owners show their rating)

### 🟢 Normal User
- Register and log in
- Browse all stores with search/filter
- Submit and modify ratings (1–5 stars) for stores
- Update their password

### 🟡 Store Owner
- Log in (created by admin)
- View dashboard: average store rating + list of customers who rated
- Update their password

---

## Form Validation Rules

| Field | Rule |
|-------|------|
| Name | 20–60 characters |
| Email | Standard email format |
| Password | 8–16 chars, min 1 uppercase, min 1 special character |
| Address | Max 400 characters |
| Rating | Integer 1–5 |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/profile | Get current user profile |
| PUT | /api/auth/update-password | Update password |

### Admin (requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard | Get platform stats |
| GET | /api/admin/users | List users (with filters/sort) |
| GET | /api/admin/users/:id | Get user details |
| POST | /api/admin/users | Create user |
| GET | /api/admin/stores | List stores (with filters/sort) |
| POST | /api/admin/stores | Create store |

### Stores (requires user role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/stores | List all stores with user's rating |
| POST | /api/stores/:id/ratings | Submit rating |
| PUT | /api/stores/:id/ratings | Update rating |

### Owner (requires store_owner role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/owner/dashboard | Get store ratings data |

---

## Database Schema

```sql
users       (id, name, email, password, address, role, created_at, updated_at)
stores      (id, name, email, address, owner_id → users.id, created_at, updated_at)
ratings     (id, user_id → users.id, store_id → stores.id, rating, created_at, updated_at)
```

---

## Troubleshooting

**MySQL connection refused**
- Ensure MySQL service is running: `sudo service mysql start` (Linux) or start via MySQL Workbench
- Double-check DB_PASSWORD in `.env`

**Port already in use**
- Change `PORT=5000` in backend `.env`
- The frontend proxy in `package.json` points to port 5000 — update it too if changed

**npm install fails**
- Ensure Node.js v16+ is installed: `node --version`
- Try clearing npm cache: `npm cache clean --force`

**"Email already registered" on first admin setup**
- The admin was already created. Just log in with admin@storerating.com / Admin@123

---

## Project Structure

```
store-rating-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MySQL pool connection
│   │   │   ├── initDb.js          # Auto DB initialization
│   │   │   └── schema.sql         # Reference SQL schema
│   │   ├── controllers/
│   │   │   ├── authController.js  # Register, login, password
│   │   │   ├── adminController.js # Admin CRUD
│   │   │   ├── storeController.js # User store listing & ratings
│   │   │   └── ownerController.js # Owner dashboard
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT authenticate & authorize
│   │   │   └── validation.js      # express-validator rules
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── admin.js
│   │   │   ├── stores.js
│   │   │   └── owner.js
│   │   └── index.js               # Express app entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   ├── StarRating.js
    │   │   └── SortableHeader.js
    │   ├── context/
    │   │   └── AuthContext.js     # Auth state & JWT management
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── AdminDashboard.js
    │   │   ├── AdminUsers.js
    │   │   ├── AdminStores.js
    │   │   ├── UserStores.js
    │   │   ├── OwnerDashboard.js
    │   │   └── ProfilePage.js
    │   ├── App.js                 # Routes & protected routes
    │   ├── index.js
    │   └── index.css              # Global design system
    └── package.json
```
