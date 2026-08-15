# CloudWise — Cloud Cost & Resource Management Dashboard

CloudWise is a full-stack dashboard for monitoring and managing cloud resources (EC2, S3, RDS, IAM), tracking costs, and getting optimization recommendations. It currently runs on seeded MongoDB demo data — architected so it can be connected to real AWS resources later without frontend changes.

---

## Tech Stack

**Frontend:** React + Vite, Tailwind CSS, React Router, Axios, Recharts, lucide-react
**Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT Authentication, bcrypt, PDFKit

---

## Folder Structure
cloudwise/
├── backend/
│ ├── config/ # MongoDB connection
│ ├── controllers/ # Thin HTTP layer — routes call these
│ ├── services/ # Business logic + data access (MongoDB today, AWS SDK later)
│ ├── middleware/ # JWT auth guard, central error handler
│ ├── models/ # Mongoose schemas
│ ├── routes/ # Express routers
│ ├── seed/ # Demo data seeder
│ ├── .env.example
│ └── server.js
├── frontend/
│ ├── src/
│ │ ├── api/ # Axios instance with interceptors
│ │ ├── components/ # Reusable UI (Navbar, Sidebar, modals, cards)
│ │ ├── context/ # Auth, Theme, Toast providers
│ │ ├── pages/ # One component per route
│ │ ├── utils/ # Validators, currency helpers
│ │ ├── App.jsx
│ │ └── main.jsx
│ ├── .env.example
│ └── vite.config.js
└── README.md
---

## Features

- **Dashboard** — Dashboard — dynamic cards and charts (cost trend, cost by service, resource status, distribution), auto-refreshes every 15s
- **Resource management** — EC2, S3, RDS, IAM: list, create (Quick Actions), stop/start, delete
- **Cost Analysis** — daily/monthly trends, cost by service
- **Optimization Center** — cost-saving recommendations
- **Monitoring** — system health score, CPU utilization
- **Alerts** — active/resolved tabs, auto-generated on certain thresholds (high CPU, low RDS performance, S3 Glacier usage)
- **Reports** — CSV and PDF download, generated server-side from live data
- **Global Search** — across resources, alerts, recommendations, reports
- **Settings** — theme (dark/light), currency (USD/INR/EUR/GBP), budget limit, notifications, language, timezone — all persisted in MongoDB
- **User Profile** — edit name/company/avatar/role, change password
- **Toast notifications, loading states, error handling with retry, logout confirmation, client + server form validation**

---

## Installation

### Prerequisites
- Node.js 18+ and npm
- A MongoDB connection string (local MongoDB, or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and set `MONGO_URI` to your MongoDB connection string.

```bash
npm run seed   # populates a demo user and sample resources/costs/alerts
npm run dev    # starts the API on http://localhost:5000
```

Check the terminal output after `npm run seed` for the generated login credentials.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev    # starts the app on http://localhost:5173
```

Open the printed local URL in your browser and log in with the seeded credentials, or register a new account.

---

## Environment Variables

### `backend/.env`

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the API server listens on | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.../cloudwise` |
| `JWT_SECRET` | Secret used to sign auth tokens | `some_long_random_string` |
| `JWT_EXPIRE` | Auth token expiry | `7d` |
| `CLIENT_URL` | Frontend origin, used for CORS | `http://localhost:5173` |

### `frontend/.env`

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL the frontend calls | `http://localhost:5000/api` |

---

## API Reference

All routes except register/login require `Authorization: Bearer <token>`.

**Auth** — `/api/auth`: register, login, me (GET/PUT), change-password
**Dashboard** — `GET /api/dashboard`
**Resources** — `/api/ec2`, `/api/s3`, `/api/rds`, `/api/iam` (GET, POST; PUT `/toggle` for EC2/RDS; DELETE)
**Cost Analysis** — `GET /api/cost-analysis`
**Optimization** — `GET /api/recommendations`
**Monitoring** — `GET /api/system-health`
**Alerts** — `GET /api/alerts`, `PUT /api/alerts/:id/resolve`
**Reports** — `GET /api/reports`, `/csv`, `/pdf`
**Search** — `GET /api/search?q=term`
**Settings** — `GET`/`PUT /api/settings`

---

## Architecture Notes

- **Service layer** — controllers only handle HTTP concerns; each `services/*.js` file owns the actual data logic. This is the single point that will change when swapping mock MongoDB data for live AWS SDK calls — controllers, routes, and the frontend stay untouched.
- **Unified Resource model** — EC2/S3/RDS/IAM share one Mongoose schema with a `type` discriminator, making cross-resource dashboard aggregation simple and new resource types easy to add.
- **Multi-tenant by design** — every collection is scoped by a `user` field, filtered from the verified JWT, never from client input.

---

## Future: Real AWS Integration

CloudWise currently runs entirely on seeded MongoDB demo data. Planned next steps:

1. Add AWS SDK v3 clients (`@aws-sdk/client-ec2`, `client-s3`, `client-rds`, `client-iam`) to the backend
2. Replace the MongoDB queries inside each `services/*.js` file with real AWS SDK calls, keeping the same return shape
3. Sync real billing data via the AWS Cost Explorer API
4. Store per-user AWS credentials (encrypted) for multi-account support
5. Dockerize backend + frontend, deploy (Vercel for frontend, Render/Railway for backend)

No frontend changes are required for this migration — the API contract stays the same.
