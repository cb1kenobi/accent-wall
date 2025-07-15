import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const designsTable = pgTable(
  'designs',
  {
    id: serial('id').primaryKey(),
    designId: uuid('design_id').notNull().default(sql`gen_random_uuid()`),
    email: text('email').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    data: jsonb('data').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    designIdIdx: index('design_id_idx').on(table.designId),
    emailIdx: index('email_idx').on(table.email),
  })
);
