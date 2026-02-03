import { eq, sql, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  creditTransactions,
  users,
  type CreditTransaction,
  type NewCreditTransaction,
} from "./schema";

// Credit configuration
export const CREDIT_CONFIG = {
  EARN_PER_REVIEW: 1,
  COST_PER_SUBMISSION: 1,
  INITIAL_CREDITS: 10, // Welcome bonus for new users
  MIN_REVIEW_LENGTH: 100, // minimum characters per section
};

/**
 * Get user's current credit balance
 */
export async function getUserCredits(userId: string): Promise<number> {
  const db = getDb();

  const result = await db
    .select({
      total: sql<number>`COALESCE(SUM(${creditTransactions.amount}), 0)`,
    })
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId));

  return Number(result[0]?.total || 0);
}

/**
 * Get user's credit transaction history
 */
export async function getCreditHistory(
  userId: string,
  limit = 50,
  offset = 0,
): Promise<CreditTransaction[]> {
  const db = getDb();

  const transactions = await db
    .select()
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId))
    .orderBy(desc(creditTransactions.createdAt))
    .limit(limit)
    .offset(offset);

  return transactions;
}

/**
 * Add credits to user (for reviews, bonuses, etc.)
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: NewCreditTransaction["type"],
  description?: string,
  relatedProjectId?: string,
  relatedReviewId?: string,
): Promise<CreditTransaction> {
  const db = getDb();

  const [transaction] = await db
    .insert(creditTransactions)
    .values({
      userId,
      amount: Math.abs(amount), // ensure positive
      type,
      description,
      relatedProjectId,
      relatedReviewId,
    })
    .returning();

  return transaction;
}

/**
 * Grant initial credits to a new user (welcome bonus)
 */
export async function grantInitialCredits(userId: string): Promise<void> {
  if (CREDIT_CONFIG.INITIAL_CREDITS <= 0) return;

  await addCredits(
    userId,
    CREDIT_CONFIG.INITIAL_CREDITS,
    "bonus",
    "Welcome bonus - Start submitting projects!",
  );
}

/**
 * Spend credits (for submissions)
 */
export async function spendCredits(
  userId: string,
  amount: number,
  type: NewCreditTransaction["type"],
  description?: string,
  relatedProjectId?: string,
): Promise<{
  success: boolean;
  transaction?: CreditTransaction;
  error?: string;
}> {
  const db = getDb();

  // Check current balance
  const currentBalance = await getUserCredits(userId);

  if (currentBalance < amount) {
    return {
      success: false,
      error: `Insufficient credits. You have ${currentBalance} credits but need ${amount}.`,
    };
  }

  // Deduct credits (negative amount)
  const [transaction] = await db
    .insert(creditTransactions)
    .values({
      userId,
      amount: -Math.abs(amount), // ensure negative
      type,
      description,
      relatedProjectId,
    })
    .returning();

  return { success: true, transaction };
}

/**
 * Check if user can afford to spend credits
 */
export async function canAfford(
  userId: string,
  amount: number,
): Promise<boolean> {
  const balance = await getUserCredits(userId);
  return balance >= amount;
}

/**
 * Get credit stats for user
 */
export async function getCreditStats(userId: string): Promise<{
  balance: number;
  totalEarned: number;
  totalSpent: number;
  reviewsCompleted: number;
  projectsSubmitted: number;
}> {
  const db = getDb();

  const result = await db
    .select({
      totalEarned: sql<number>`COALESCE(SUM(CASE WHEN ${creditTransactions.amount} > 0 THEN ${creditTransactions.amount} ELSE 0 END), 0)`,
      totalSpent: sql<number>`COALESCE(SUM(CASE WHEN ${creditTransactions.amount} < 0 THEN ABS(${creditTransactions.amount}) ELSE 0 END), 0)`,
      reviewsCompleted: sql<number>`COUNT(CASE WHEN ${creditTransactions.type} = 'earned_review' THEN 1 END)`,
      projectsSubmitted: sql<number>`COUNT(CASE WHEN ${creditTransactions.type} = 'spent_submission' THEN 1 END)`,
    })
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId));

  const stats = result[0];

  return {
    balance: Number(stats?.totalEarned || 0) - Number(stats?.totalSpent || 0),
    totalEarned: Number(stats?.totalEarned || 0),
    totalSpent: Number(stats?.totalSpent || 0),
    reviewsCompleted: Number(stats?.reviewsCompleted || 0),
    projectsSubmitted: Number(stats?.projectsSubmitted || 0),
  };
}
