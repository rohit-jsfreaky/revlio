import { pgTable, uuid, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const earlyAccess = pgTable("early_access", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  source: varchar("source", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  confirmed: boolean("confirmed").default(false).notNull(),
});

export type EarlyAccess = typeof earlyAccess.$inferSelect;
export type NewEarlyAccess = typeof earlyAccess.$inferInsert;
