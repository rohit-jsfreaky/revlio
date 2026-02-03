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

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  googleId: varchar("google_id", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }),
  avatarUrl: varchar("avatar_url", { length: 512 }),
  emailVerified: boolean("email_verified").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const oauthStates = pgTable("oauth_states", {
  id: uuid("id").defaultRandom().primaryKey(),
  provider: varchar("provider", { length: 20 }).notNull(),
  stateHash: varchar("state_hash", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const emailOtps = pgTable("email_otps", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  codeHash: varchar("code_hash", { length: 255 }).notNull(),
  purpose: varchar("purpose", { length: 20 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type EarlyAccess = typeof earlyAccess.$inferSelect;
export type NewEarlyAccess = typeof earlyAccess.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type EmailOtp = typeof emailOtps.$inferSelect;
export type NewEmailOtp = typeof emailOtps.$inferInsert;
export type OauthState = typeof oauthStates.$inferSelect;
export type NewOauthState = typeof oauthStates.$inferInsert;
