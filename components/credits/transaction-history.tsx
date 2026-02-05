"use client";

import Link from "next/link";
import {
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  RefreshCw,
  Wrench,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTransactionDate, type CreditTransaction } from "@/hooks/credits";

// Transaction icon mapping
const transactionIcons: Record<string, React.ReactNode> = {
  earned_review: <ArrowUpRight className="h-4 w-4 text-green-600" />,
  spent_submission: <ArrowDownLeft className="h-4 w-4 text-red-600" />,
  bonus: <Gift className="h-4 w-4 text-purple-600" />,
  refund: <RefreshCw className="h-4 w-4 text-blue-600" />,
  admin_adjustment: <Wrench className="h-4 w-4 text-orange-600" />,
};

// Transaction color mapping
const transactionColors: Record<string, string> = {
  earned_review: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  spent_submission: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  bonus: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  refund: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  admin_adjustment: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
};

interface TransactionHistoryProps {
  transactions: CreditTransaction[];
}

function TransactionItem({ transaction }: { transaction: CreditTransaction }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            transactionColors[transaction.type] || "bg-muted"
          }`}
        >
          {transactionIcons[transaction.type] || <Coins className="h-4 w-4" />}
        </div>
        <div>
          <p className="font-medium">
            {transaction.description || transaction.type.replace(/_/g, " ")}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatTransactionDate(transaction.createdAt)}
          </p>
        </div>
      </div>
      <Badge
        variant="outline"
        className={
          transaction.amount > 0
            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
        }
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
      <Coins className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Transaction History
        </CardTitle>
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
