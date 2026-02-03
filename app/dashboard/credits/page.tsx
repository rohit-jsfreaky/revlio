"use client";

import { useState, useEffect } from "react";
import { 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Gift, 
  RefreshCw,
  Wrench,
  TrendingUp,
  Star,
  Clock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useCredits } from "@/components/dashboard/dashboard-layout";

interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
}

interface CreditStats {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  reviewsCompleted: number;
  projectsSubmitted: number;
}

const transactionIcons: Record<string, React.ReactNode> = {
  earned_review: <ArrowUpRight className="h-4 w-4 text-green-600" />,
  spent_submission: <ArrowDownLeft className="h-4 w-4 text-red-600" />,
  bonus: <Gift className="h-4 w-4 text-purple-600" />,
  refund: <RefreshCw className="h-4 w-4 text-blue-600" />,
  admin_adjustment: <Wrench className="h-4 w-4 text-orange-600" />,
};

const transactionColors: Record<string, string> = {
  earned_review: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  spent_submission: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  bonus: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  refund: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  admin_adjustment: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    }
    return `${hours}h ago`;
  } else if (days === 1) {
    return "Yesterday";
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    });
  }
}

export default function CreditsPage() {
  const { credits, refreshCredits } = useCredits();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [stats, setStats] = useState<CreditStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [historyRes, statsRes] = await Promise.all([
          fetch("/api/credits?type=history"),
          fetch("/api/credits?type=stats"),
        ]);
        
        const [history, statsData] = await Promise.all([
          historyRes.json(),
          statsRes.json(),
        ]);
        
        setTransactions(history);
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching credit data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Coins className="h-6 w-6 text-amber-600" />
            Credits
          </h1>
          <p className="text-muted-foreground mt-1">
            Earn credits by reviewing projects, spend them to get reviews
          </p>
        </div>
        <Button variant="outline" onClick={refreshCredits} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Balance */}
        <Card className="bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-amber-900 dark:text-amber-100">
                {credits}
              </span>
              <span className="text-amber-700 dark:text-amber-300">credits</span>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
              {credits >= 1 
                ? "You can submit a project!" 
                : "Review projects to earn credits"}
            </p>
          </CardContent>
        </Card>

        {/* Total Earned */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-green-600">
                +{stats?.totalEarned || 0}
              </span>
              <span className="text-muted-foreground">credits</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              From {stats?.reviewsCompleted || 0} completed reviews
            </p>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-blue-600" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-600">
                {stats?.totalSpent || 0}
              </span>
              <span className="text-muted-foreground">credits</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              On {stats?.projectsSubmitted || 0} project submissions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* How Credits Work */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How Credits Work</CardTitle>
          <CardDescription>
            The Revlio credit system ensures quality feedback for everyone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <div className="shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold">Earn Credits</h4>
                <p className="text-sm text-muted-foreground">
                  Complete thoughtful reviews (min. 100 chars per section) to earn <strong>1 credit</strong> per review
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <ArrowDownLeft className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">Spend Credits</h4>
                <p className="text-sm text-muted-foreground">
                  Submit your project for review and spend <strong>1 credit</strong> to receive 3 reviews
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>
            Your recent credit transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
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
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transactionColors[transaction.type] || 'bg-muted'}`}>
                      {transactionIcons[transaction.type] || <Coins className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">
                        {transaction.description || transaction.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={transaction.amount > 0 
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" 
                      : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
                    }
                  >
                    {transaction.amount > 0 ? "+" : ""}{transaction.amount} credit{Math.abs(transaction.amount) !== 1 ? "s" : ""}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="group hover:border-green-500 transition-colors cursor-pointer">
          <Link href="/dashboard/reviews">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowUpRight className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Review Projects</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn credits by helping other makers
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className={`group transition-colors cursor-pointer ${credits >= 1 ? "hover:border-blue-500" : "opacity-60"}`}>
          <Link href={credits >= 1 ? "/dashboard/submit" : "#"} className={credits < 1 ? "pointer-events-none" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Submit Project</h3>
                  <p className="text-sm text-muted-foreground">
                    {credits >= 1 ? "Get feedback from real makers" : "Need 1 credit to submit"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
