# ATS

Applicant Tracking System built with React, Node.js, and PostgreSQL.

## Setup

### Option 1: Docker (Recommended for Teams)

```bash
cp .env.example .env
docker-compose up
```

Backend: http://localhost:5001  
Frontend: http://localhost:3000

### Option 2: Local Development

#### Prerequisites
- Node.js
- PostgreSQL (local installation or Postgres.app)

#### Backend
```bash
cd backend
npm install
cp .env.example .env
./db/setup.sh  # Creates database and runs migrations
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Database

### Docker Setup
Database runs automatically in Docker. Migrations run on first startup.

### Local Setup
Each developer runs their own local PostgreSQL instance:
- Database name: `ats_db`
- Default connection: `postgresql://localhost:5432/ats_db`
- Configure `DATABASE_URL` in `backend/.env` if different

Run `./backend/db/setup.sh` to set up the database schema.

<img width="280" height="484" alt="Screenshot 2025-12-04 at 11 10 07 PM" src="https://github.com/user-attachments/assets/e5e4d794-e771-4855-b609-6ecd8e39c0f7" />
