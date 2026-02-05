"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTransactionDate, type CreditTransaction } from "@/hooks/credits";

const transactionMeta: Record<
  string,
  { label: string; dotClass: string; badgeClass: string }
> = {
  earned_review: {
    label: "Review Earned",
    dotClass: "bg-emerald-500/70",
    badgeClass:
      "border-emerald-200/70 bg-emerald-50/60 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  spent_submission: {
    label: "Submission Spent",
    dotClass: "bg-rose-500/70",
    badgeClass:
      "border-rose-200/70 bg-rose-50/60 text-rose-700 dark:border-rose-800/50 dark:bg-rose-900/30 dark:text-rose-300",
  },
  bonus: {
    label: "Bonus",
    dotClass: "bg-violet-500/70",
    badgeClass:
      "border-violet-200/70 bg-violet-50/60 text-violet-700 dark:border-violet-800/50 dark:bg-violet-900/30 dark:text-violet-300",
  },
  refund: {
    label: "Refund",
    dotClass: "bg-sky-500/70",
    badgeClass:
      "border-sky-200/70 bg-sky-50/60 text-sky-700 dark:border-sky-800/50 dark:bg-sky-900/30 dark:text-sky-300",
  },
  admin_adjustment: {
    label: "Admin Adjustment",
    dotClass: "bg-amber-500/70",
    badgeClass:
      "border-amber-200/70 bg-amber-50/60 text-amber-700 dark:border-amber-800/50 dark:bg-amber-900/30 dark:text-amber-300",
  },
};

interface TransactionHistoryProps {
  transactions: CreditTransaction[];
}

function TransactionItem({ transaction }: { transaction: CreditTransaction }) {
  const meta = transactionMeta[transaction.type] ?? {
    label: "Credit Update",
    dotClass: "bg-muted-foreground/40",
    badgeClass: "border-border/60 bg-muted/40 text-foreground/80",
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/80 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className={`mt-2 h-2.5 w-2.5 rounded-full ${meta.dotClass}`} />
        <div>
          <p className="font-medium text-foreground">
            {transaction.description || transaction.type.replace(/_/g, " ")}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="uppercase tracking-wider">{meta.label}</span>
            <span>•</span>
            <span>{formatTransactionDate(transaction.createdAt)}</span>
          </div>
        </div>
      </div>
      <Badge
        variant="outline"
        className={`ml-auto w-fit rounded-full px-3 py-1 text-xs font-semibold ${meta.badgeClass}`}
      >
        {transaction.amount > 0 ? "+" : ""}
        {transaction.amount} credit{Math.abs(transaction.amount) !== 1 ? "s" : ""}
      </Badge>
    </div>
  );
}

function EmptyTransactions() {
  return (
    <div className="text-center py-12">
      <h3 className="font-semibold text-lg mb-2">No transactions yet</h3>
      <p className="text-muted-foreground mb-4">
        Start reviewing projects to earn your first credits!
      </p>
      <Button asChild>
        <Link href="/dashboard/reviews">Start Reviewing</Link>
      </Button>
    </div>
  );
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle className="text-lg">Transaction History</CardTitle>
        <CardDescription>Your recent credit transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <EmptyTransactions />
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
