import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: ['.env', '.env.local'], override: true });

export default defineConfig({
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  dialect: 'postgresql',
  out: './drizzle',
  schema: './src/db/schema.ts',
  strict: true,
  verbose: true,
});
