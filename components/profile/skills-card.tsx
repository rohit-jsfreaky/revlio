"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SkillsCardProps {
  skills: string[];
}

export function SkillsCard({ skills }: SkillsCardProps) {
  return (
    <Card className="rounded-2xl border-border/60 bg-card/80">
      <CardHeader className="border-b border-border/60 pb-4">
        <CardTitle className="text-base">Tech Stack</CardTitle>
        <CardDescription>Technologies and skills you work with most.</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {skills && skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="rounded-full border border-border/60 bg-muted/60 px-3 py-1 text-xs font-medium text-foreground/80"
              >
                {skill}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-4 text-center text-sm text-muted-foreground">
            No skills added yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
