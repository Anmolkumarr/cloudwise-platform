# CloudWise — Cloud Cost & Resource Management Dashboard

Complete frontend + backend application (pre-cloud stage), matching the
reference dashboard design. Ready for you to plug AWS/Docker/Terraform/K8s
on top later.

## Stack
- **Frontend:** React + Vite, React Router, Axios, Recharts, Tailwind CSS
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT Auth
- **Flow:** Frontend → API → MongoDB (no mock data hardcoded in frontend)

## Folder structure
```
cloudwise/
├── backend/          Express API + MongoDB models + JWT auth
└── frontend/         React + Vite dashboard UI
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set `MONGO_URI` (local Mongo or MongoDB Atlas connection
string) and a strong `JWT_SECRET`.

Seed realistic demo data (creates a demo user + resources/costs/alerts):

```bash
npm run seed
```

This creates login: **demo@cloudwise.com / demo1234**

Start the API:

```bash
npm run dev      # nodemon, auto-restart
# or
npm start
```

API runs on `http://localhost:5000`.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env    # VITE_API_URL=http://localhost:5000/api
npm run dev
```

Frontend runs on `http://localhost:5173`.

## 3. Login

Open `http://localhost:5173`, you'll be redirected to `/login`. Demo
credentials are pre-filled — or register a new account at `/register`.

## Pages implemented
/login, /register, /dashboard, /ec2, /s3, /rds, /iam, /cost-analysis,
/optimization, /monitoring, /alerts, /reports, /settings — all wired to
real API endpoints, no mock data in the frontend.

## API endpoints
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

GET  /api/dashboard

GET  /api/ec2
GET  /api/s3
GET  /api/rds
GET  /api/iam

GET  /api/cost-analysis
GET  /api/recommendations
GET  /api/system-health

GET  /api/alerts
PUT  /api/alerts/:id/resolve

GET  /api/activity
GET  /api/reports
```

All routes except register/login are protected via JWT (`Authorization:
Bearer <token>`).

## Database collections
Users, Resources (EC2/S3/RDS/IAM unified schema with type field), Costs,
Recommendations, Alerts, Activities.

## Next steps (your part — cloud/DevOps)
- Swap mock-seeded Resource/Cost data for real AWS SDK calls (boto3/AWS-SDK
  for JS) behind the same API contracts — frontend won't need to change.
- Dockerize backend + frontend, add docker-compose with MongoDB.
- CI/CD pipeline (GitHub Actions → build → push → deploy).
- Terraform for AWS infra (ECS/EKS, RDS, S3, IAM roles).
- Kubernetes manifests / Helm chart for the containerized app.

## Notes
- Passwords are hashed with bcrypt; JWT expires in 7 days (configurable).
- Architecture keeps resource fetching behind a single unified `Resource`
  model per type, so it's straightforward to swap seeded data for live AWS
  API responses without touching frontend code.
