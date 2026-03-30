#!/bin/bash
set -e
pnpm install --frozen-lockfile

# Pre-migration: cast dependent_count to integer if production DB still has it as text.
# PostgreSQL cannot auto-cast text→integer in ALTER TABLE; the USING clause handles it safely.
if [ -n "$DATABASE_URL" ]; then
  psql "$DATABASE_URL" -c "
    DO \$\$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name  = 'resilience_reports'
          AND column_name = 'dependent_count'
          AND data_type NOT IN ('integer', 'bigint', 'smallint')
      ) THEN
        ALTER TABLE resilience_reports
          ALTER COLUMN dependent_count TYPE integer
          USING CASE
            WHEN dependent_count ~ '^[0-9]+\$' THEN dependent_count::integer
            ELSE 0
          END;
        RAISE NOTICE 'dependent_count migrated to integer';
      END IF;
    END
    \$\$;
  " || true
fi

pnpm --filter db push
