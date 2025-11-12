#!/bin/bash

DB_NAME="ats_db"
SCHEMA_FILE="db/migrations/001_initial_schema.sql"

echo "Setting up database: $DB_NAME"

if command -v psql &> /dev/null; then
    PSQL_CMD="psql"
elif [ -f "/Applications/Postgres.app/Contents/Versions/latest/bin/psql" ]; then
    PSQL_CMD="/Applications/Postgres.app/Contents/Versions/latest/bin/psql"
else
    echo "Error: psql not found. Please install PostgreSQL and ensure it's in your PATH."
    exit 1
fi

$PSQL_CMD -c "SELECT 1" postgres &> /dev/null || {
    echo "Error: Cannot connect to PostgreSQL. Is it running?"
    exit 1
}

$PSQL_CMD -c "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || {
    echo "Creating database $DB_NAME..."
    $PSQL_CMD -c "CREATE DATABASE $DB_NAME"
}

echo "Running migrations..."
$PSQL_CMD -d $DB_NAME -f $SCHEMA_FILE

echo "Database setup complete!"

