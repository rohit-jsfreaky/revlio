"use client";

import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Projects</h1>
          <p className="text-muted-foreground">
            Manage your submitted projects and view feedback.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/submit">
            <Plus className="mr-2 h-4 w-4" />
            Submit Project
          </Link>
        </Button>
      </div>

      {/* Empty state */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-blue-50 dark:bg-blue-900/30 p-4 mb-4">
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Submit your first project to get guaranteed feedback from the community.
            You need credits to submit a project.
          </p>
          <Button asChild>
            <Link href="/dashboard/submit">
              <Plus className="mr-2 h-4 w-4" />
              Submit Your First Project
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
