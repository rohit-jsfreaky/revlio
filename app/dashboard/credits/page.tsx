"use client";

import { useState, useEffect } from "react";
import {
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Clock,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CreditsPage() {
  const credits = 0; // Will be fetched from API
  const lifetimeEarned = 0;
  const lifetimeSpent = 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Credits</h1>
        <p className="text-muted-foreground">
          Track your credit balance and transaction history.
        </p>
      </div>

      {/* Credit stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 dark:text-amber-300">Current Balance</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{credits}</p>
              </div>
              <div className="rounded-full bg-amber-200 dark:bg-amber-800 p-3">
                <Coins className="h-6 w-6 text-amber-700 dark:text-amber-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-50 dark:bg-green-900/30 p-3">
                <ArrowUpRight className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lifetime Earned</p>
                <p className="text-2xl font-bold">{lifetimeEarned}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-3">
                <ArrowDownLeft className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lifetime Spent</p>
                <p className="text-2xl font-bold">{lifetimeSpent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How to earn */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            How to Earn Credits
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  Credits are the currency of Revlio
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription>
            Complete actions to earn credits that can be spent on project submissions and boosts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="rounded-full bg-green-100 dark:bg-green-900/50 p-2">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium">Review a project</p>
                <p className="text-sm text-muted-foreground">+1 credit</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-2">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium">First review of the day</p>
                <p className="text-sm text-muted-foreground">+0.5 bonus</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/50 p-2">
                <Coins className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium">Helpful review</p>
                <p className="text-sm text-muted-foreground">+0.5 bonus</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction history */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your credit earning and spending history.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Clock className="h-8 w-8 mb-4 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm">Start reviewing projects to earn credits!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
