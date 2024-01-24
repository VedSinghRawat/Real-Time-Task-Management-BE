import type { Config } from 'drizzle-kit'
export default {
  schema: './src/database/database.schema.ts',
  out: './supabase/migrations',
  driver: 'pg',
} satisfies Config
