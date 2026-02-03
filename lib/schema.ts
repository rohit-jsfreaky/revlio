import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  jsonb,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const creditTransactionTypeEnum = pgEnum("credit_transaction_type", [
  "earned_review",
  "spent_submission",
  "bonus",
  "refund",
  "admin_adjustment",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "pending_review",
  "active",
  "archived",
]);

export const projectCategoryEnum = pgEnum("project_category", [
  "saas",
  "tool",
  "app",
  "portfolio",
  "api",
  "open_source",
  "other",
]);

export const reviewStatusEnum = pgEnum("review_status", [
  "assigned",
  "in_progress",
  "submitted",
  "expired",
]);

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

  // Onboarding fields
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  bio: text("bio"),
  website: varchar("website", { length: 512 }),
  position: varchar("position", { length: 255 }),
  skills: jsonb("skills").$type<string[]>().default([]),

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

// ============================================
// Credit System
// ============================================

export const creditTransactions = pgTable("credit_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // positive = earned, negative = spent
  type: creditTransactionTypeEnum("type").notNull(),
  description: text("description"),
  relatedProjectId: uuid("related_project_id"),
  relatedReviewId: uuid("related_review_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ============================================
// Projects System
// ============================================

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  problemSolved: text("problem_solved"),
  liveUrl: varchar("live_url", { length: 512 }),
  githubUrl: varchar("github_url", { length: 512 }),
  techStack: jsonb("tech_stack").$type<string[]>().default([]),
  category: projectCategoryEnum("category").notNull().default("other"),
  screenshotUrl: varchar("screenshot_url", { length: 512 }),
  status: projectStatusEnum("status").notNull().default("pending_review"),
  version: varchar("version", { length: 50 }).default("1.0.0"),
  creditsSpent: integer("credits_spent").notNull().default(1),
  reviewsRequired: integer("reviews_required").notNull().default(3),
  reviewsReceived: integer("reviews_received").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ============================================
// Reviews System
// ============================================

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  reviewerId: uuid("reviewer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // 3-section structured feedback
  whatsGood: text("whats_good").notNull(),
  whatsUnclear: text("whats_unclear").notNull(),
  improvementSuggestion: text("improvement_suggestion").notNull(),

  // Metadata
  creditsEarned: integer("credits_earned").notNull().default(1),
  isHelpful: boolean("is_helpful"),
  ownerReply: text("owner_reply"),

  status: reviewStatusEnum("status").notNull().default("submitted"),
  submittedAt: timestamp("submitted_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const reviewAssignments = pgTable("review_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  reviewerId: uuid("reviewer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: reviewStatusEnum("status").notNull().default("assigned"),
  assignedAt: timestamp("assigned_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

// ============================================
// Review Drafts (for save as draft)
// ============================================

export const reviewDrafts = pgTable("review_drafts", {
  id: uuid("id").defaultRandom().primaryKey(),
  assignmentId: uuid("assignment_id")
    .notNull()
    .references(() => reviewAssignments.id, { onDelete: "cascade" }),
  whatsGood: text("whats_good"),
  whatsUnclear: text("whats_unclear"),
  improvementSuggestion: text("improvement_suggestion"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ============================================
// Social Features
// ============================================

export const projectComments = pgTable("project_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  parentId: uuid("parent_id"), // For replies - references self
  isPinned: boolean("is_pinned").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const projectCommentLikes = pgTable("project_comment_likes", {
  id: uuid("id").defaultRandom().primaryKey(),
  commentId: uuid("comment_id")
    .notNull()
    .references(() => projectComments.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const projectLikes = pgTable("project_likes", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const userFollows = pgTable("user_follows", {
  id: uuid("id").defaultRandom().primaryKey(),
  followerId: uuid("follower_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  followingId: uuid("following_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ============================================
// Relations
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  reviews: many(reviews),
  creditTransactions: many(creditTransactions),
  reviewAssignments: many(reviewAssignments),
  comments: many(projectComments),
  commentLikes: many(projectCommentLikes),
  likes: many(projectLikes),
  followers: many(userFollows, { relationName: "followers" }),
  following: many(userFollows, { relationName: "following" }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, { fields: [projects.userId], references: [users.id] }),
  reviews: many(reviews),
  reviewAssignments: many(reviewAssignments),
  comments: many(projectComments),
  likes: many(projectLikes),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  project: one(projects, {
    fields: [reviews.projectId],
    references: [projects.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
  }),
}));

export const reviewAssignmentsRelations = relations(
  reviewAssignments,
  ({ one }) => ({
    project: one(projects, {
      fields: [reviewAssignments.projectId],
      references: [projects.id],
    }),
    reviewer: one(users, {
      fields: [reviewAssignments.reviewerId],
      references: [users.id],
    }),
  }),
);

export const creditTransactionsRelations = relations(
  creditTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [creditTransactions.userId],
      references: [users.id],
    }),
  }),
);

export const projectCommentsRelations = relations(
  projectComments,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [projectComments.projectId],
      references: [projects.id],
    }),
    user: one(users, {
      fields: [projectComments.userId],
      references: [users.id],
    }),
    parent: one(projectComments, {
      fields: [projectComments.parentId],
      references: [projectComments.id],
      relationName: "replies",
    }),
    replies: many(projectComments, { relationName: "replies" }),
    likes: many(projectCommentLikes),
  }),
);

export const projectCommentLikesRelations = relations(
  projectCommentLikes,
  ({ one }) => ({
    comment: one(projectComments, {
      fields: [projectCommentLikes.commentId],
      references: [projectComments.id],
    }),
    user: one(users, {
      fields: [projectCommentLikes.userId],
      references: [users.id],
    }),
  })
);

export const projectLikesRelations = relations(projectLikes, ({ one }) => ({
  project: one(projects, {
    fields: [projectLikes.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectLikes.userId],
    references: [users.id],
  }),
}));

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, {
    fields: [userFollows.followerId],
    references: [users.id],
    relationName: "following",
  }),
  following: one(users, {
    fields: [userFollows.followingId],
    references: [users.id],
    relationName: "followers",
  }),
}));

// ============================================
// Types
// ============================================

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type NewCreditTransaction = typeof creditTransactions.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type ReviewAssignment = typeof reviewAssignments.$inferSelect;
export type NewReviewAssignment = typeof reviewAssignments.$inferInsert;
export type ReviewDraft = typeof reviewDrafts.$inferSelect;
export type NewReviewDraft = typeof reviewDrafts.$inferInsert;
export type ProjectComment = typeof projectComments.$inferSelect;
export type NewProjectComment = typeof projectComments.$inferInsert;
export type ProjectCommentLike = typeof projectCommentLikes.$inferSelect;
export type NewProjectCommentLike = typeof projectCommentLikes.$inferInsert;
export type ProjectLike = typeof projectLikes.$inferSelect;
export type NewProjectLike = typeof projectLikes.$inferInsert;
export type UserFollow = typeof userFollows.$inferSelect;
export type NewUserFollow = typeof userFollows.$inferInsert;
