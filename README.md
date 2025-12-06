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

## Diagrams

<img width="280" height="484" alt="Screenshot 2025-12-04 at 11 10 07 PM" src="https://github.com/user-attachments/assets/e5e4d794-e771-4855-b609-6ecd8e39c0f7" />

This is a class diagram of the rating system for our project. The data model links forms, form responses, and ratings in a simple 1→many→many structure. Forms define the questions, responses store each applicant’s submitted data, and ratings allow multiple reviewers to score and comment on each response. Cascade rules ensure that deleting a form also removes its responses and their associated ratings.


<img width="658" height="448" alt="statediagram_fixed drawio" src="https://github.com/user-attachments/assets/ed530888-d18b-40b9-83ee-06b74f37dc13" />


This is a state diagram for the authorization of a user logging in to our web application. The authentication system follows a four-state flow: Loading, Unauthenticated, Authenticating, and Authenticated. On startup, the app enters a loading state and checks for an existing session—sending the user to either authenticated or unauthenticated. From there, users can log in or register, transitioning through an authenticating state before becoming authenticated on success. Invalid sessions or logout actions always return the user to the unauthenticated state.

## Features
1. Analytics Dashboard
2. Timeline/Event Management
3. Applicant Rating System
4. CSV Export
5. Search/Filtering Options
6. Form Builder
7. Login w/ RegEx Verification
