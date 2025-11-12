# Database Setup

## Local Development (Recommended)

Each team member runs their own local PostgreSQL database.

1. Install PostgreSQL (Postgres.app or Homebrew)
2. Run setup script: `./db/setup.sh`
3. Configure `DATABASE_URL` in `.env`

## Shared Development Database (Optional)

For a shared dev database, use a cloud PostgreSQL service:
- **Free options**: Supabase, Neon, Railway (free tiers)
- **Paid options**: AWS RDS, Heroku Postgres

Update `DATABASE_URL` in `.env` to point to shared database.

## Migrations

Schema changes go in `migrations/` directory:
- `001_initial_schema.sql` - Initial tables
- Future migrations: `002_add_users.sql`, etc.

Run migrations: `psql ats_db -f db/migrations/001_initial_schema.sql`

