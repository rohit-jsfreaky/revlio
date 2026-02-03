"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Link as LinkIcon,
  Github,
  Coins,
  Loader2,
  Image as ImageIcon,
  Save,
  ArrowUp,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  description: string;
  problemSolved: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  category: string;
  techStack: string[];
  screenshotUrl: string | null;
  version: string | null;
}

interface ProjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  project: Project | null;
  credits: number;
}

const CATEGORIES = [
  { value: "saas", label: "SaaS" },
  { value: "tool", label: "Developer Tool" },
  { value: "app", label: "Mobile/Web App" },
  { value: "portfolio", label: "Portfolio" },
  { value: "api", label: "API/Backend" },
  { value: "open_source", label: "Open Source" },
  { value: "other", label: "Other" },
];

const TECH_OPTIONS = [
  "React",
  "Next.js",
  "Vue",
  "Angular",
  "Svelte",
  "Node.js",
  "Python",
  "Go",
  "Rust",
  "TypeScript",
  "JavaScript",
  "TailwindCSS",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "AWS",
  "Vercel",
  "Docker",
  "GraphQL",
  "REST API",
];

function parseVersion(v: string): number[] {
  const parts = v.split(".").map((p) => parseInt(p, 10) || 0);
  while (parts.length < 3) parts.push(0);
  return parts.slice(0, 3);
}

function isVersionUpgrade(current: string | null, next: string): boolean {
  if (!current) return true;
  const c = parseVersion(current);
  const n = parseVersion(next);
  for (let i = 0; i < 3; i++) {
    if (n[i] > c[i]) return true;
    if (n[i] < c[i]) return false;
  }
  return false;
}

export function ProjectEditModal({
  isOpen,
  onClose,
  onSuccess,
  project,
  credits,
}: ProjectEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    problemSolved: "",
    liveUrl: "",
    githubUrl: "",
    category: "",
    techStack: [] as string[],
    screenshotUrl: "",
    version: "",
  });
  const [techInput, setTechInput] = useState("");

  // Load project data when modal opens
  useEffect(() => {
    if (project && isOpen) {
      setFormData({
        title: project.title || "",
        description: project.description || "",
        problemSolved: project.problemSolved || "",
        liveUrl: project.liveUrl || "",
        githubUrl: project.githubUrl || "",
        category: project.category || "",
        techStack: project.techStack || [],
        screenshotUrl: project.screenshotUrl || "",
        version: project.version || "1.0.0",
      });
    }
  }, [project, isOpen]);

  const willUpgradeVersion =
    project?.version && isVersionUpgrade(project.version, formData.version);
  const needsCredit = willUpgradeVersion;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addTech = (tech: string) => {
    if (tech && !formData.techStack.includes(tech)) {
      setFormData({ ...formData, techStack: [...formData.techStack, tech] });
    }
    setTechInput("");
  };

  const removeTech = (tech: string) => {
    setFormData({
      ...formData,
      techStack: formData.techStack.filter((t) => t !== tech),
    });
  };

  const handleScreenshotUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setFormData({ ...formData, screenshotUrl: data.url });
      toast.success("Screenshot uploaded!");
    } catch {
      toast.error("Failed to upload screenshot");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (needsCredit && credits < 1) {
      toast.error(
        "Not enough credits for version upgrade. Complete reviews to earn more.",
      );
      return;
    }

    if (!formData.title || !formData.description || !formData.liveUrl) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.techStack.length === 0) {
      toast.error("Please add at least one technology");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project?.id,
          ...formData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update project");
      }

      if (data.versionUpgraded) {
        toast.success("Project updated! New version submitted for reviews.");
      } else {
        toast.success("Project updated successfully!");
      }

      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update project";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden bg-background rounded-2xl shadow-2xl border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Edit Project</h2>
            <p className="text-sm text-muted-foreground">
              Update your project details
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
          {/* Version Warning */}
          {willUpgradeVersion && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Version Upgrade
                </p>
                <p className="text-amber-700 dark:text-amber-300">
                  1 credit will be charged. Project will be submitted for new
                  reviews.
                </p>
              </div>
            </div>
          )}

          {/* Version */}
          <div className="space-y-2">
            <Label htmlFor="version">Version</Label>
            <div className="flex items-center gap-2">
              <Input
                id="version"
                name="version"
                placeholder="1.0.0"
                value={formData.version}
                onChange={handleChange}
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">
                Current: {project?.version || "1.0.0"}
              </span>
              {willUpgradeVersion && (
                <Badge
                  variant="secondary"
                  className="gap-1 bg-amber-100 text-amber-700"
                >
                  <ArrowUp className="h-3 w-3" />
                  Upgrade
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Increase version to submit for new reviews (costs 1 credit)
            </p>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Problem Solved */}
          <div className="space-y-2">
            <Label htmlFor="problemSolved">Problem Solved</Label>
            <Textarea
              id="problemSolved"
              name="problemSolved"
              value={formData.problemSolved}
              onChange={handleChange}
              rows={2}
            />
          </div>

          {/* URLs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="liveUrl">Live URL *</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="liveUrl"
                  name="liveUrl"
                  value={formData.liveUrl}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub</Label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="githubUrl"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tech Stack */}
          <div className="space-y-2">
            <Label>Tech Stack *</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.techStack.map((tech) => (
                <Badge key={tech} variant="secondary" className="gap-1">
                  {tech}
                  <button
                    onClick={() => removeTech(tech)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              placeholder="Add technology..."
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTech(techInput);
                }
              }}
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {TECH_OPTIONS.filter((t) => !formData.techStack.includes(t))
                .slice(0, 6)
                .map((tech) => (
                  <button
                    key={tech}
                    onClick={() => addTech(tech)}
                    className="text-xs px-2 py-1 rounded-full border border-border hover:bg-muted transition-colors"
                  >
                    + {tech}
                  </button>
                ))}
            </div>
          </div>

          {/* Screenshot */}
          <div className="space-y-2">
            <Label>Screenshot</Label>
            {formData.screenshotUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img
                  src={formData.screenshotUrl}
                  alt="Screenshot"
                  className="w-full h-24 object-cover"
                />
                <button
                  onClick={() =>
                    setFormData({ ...formData, screenshotUrl: "" })
                  }
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                {isUploading ? (
                  <Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <ImageIcon className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">
                      Click to upload
                    </p>
                  </>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleScreenshotUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
          {needsCredit && (
            <Badge
              variant={credits >= 1 ? "default" : "destructive"}
              className="gap-1"
            >
              <Coins className="h-3 w-3" />1 credit
            </Badge>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (needsCredit && credits < 1)}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {willUpgradeVersion ? "Save & Submit" : "Save Changes"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
