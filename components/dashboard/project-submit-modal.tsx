"use client";

import { useState, useRef } from "react";
import {
  X,
  Upload,
  Link as LinkIcon,
  Github,
  Coins,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
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

interface ProjectSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
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

const COST = 1;

export function ProjectSubmitModal({
  isOpen,
  onClose,
  onSuccess,
  credits,
}: ProjectSubmitModalProps) {
  const [step, setStep] = useState(1);
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
  });
  const [techInput, setTechInput] = useState("");

  const canAfford = credits >= COST;

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
    if (!canAfford) {
      toast.error("Not enough credits. Complete reviews to earn more.");
      return;
    }

    if (
      !formData.title ||
      !formData.description ||
      !formData.problemSolved ||
      !formData.liveUrl ||
      !formData.category
    ) {
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit project");
      }

      toast.success("Project submitted! Reviewers are being assigned.");
      setFormData({
        title: "",
        description: "",
        problemSolved: "",
        liveUrl: "",
        githubUrl: "",
        category: "",
        techStack: [],
        screenshotUrl: "",
      });
      setStep(1);
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to submit project";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden bg-background rounded-2xl shadow-2xl border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Submit Project</h2>
            <p className="text-sm text-muted-foreground">Step {step} of 2</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={canAfford ? "default" : "destructive"}
              className="gap-1"
            >
              <Coins className="h-3 w-3" />
              {COST} credit
            </Badge>
            <button
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {step === 1 && (
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., TaskFlow - AI Task Manager"
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
                  placeholder="What does your project do?"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              {/* Problem Solved */}
              <div className="space-y-2">
                <Label htmlFor="problemSolved">
                  What problem does it solve? *
                </Label>
                <Textarea
                  id="problemSolved"
                  name="problemSolved"
                  placeholder="What pain point does this address?"
                  value={formData.problemSolved}
                  onChange={handleChange}
                  rows={2}
                />
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
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {/* Live URL */}
              <div className="space-y-2">
                <Label htmlFor="liveUrl">Live URL *</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="liveUrl"
                    name="liveUrl"
                    placeholder="https://yourproject.com"
                    value={formData.liveUrl}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* GitHub URL */}
              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub URL (optional)</Label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="githubUrl"
                    name="githubUrl"
                    placeholder="https://github.com/user/repo"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
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
                <div className="flex gap-2">
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
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {TECH_OPTIONS.filter((t) => !formData.techStack.includes(t))
                    .slice(0, 8)
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
                <Label>Screenshot (optional)</Label>
                {formData.screenshotUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img
                      src={formData.screenshotUrl}
                      alt="Screenshot"
                      className="w-full h-32 object-cover"
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
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload screenshot
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
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
          {!canAfford && (
            <p className="text-sm text-destructive">
              Not enough credits. Complete reviews to earn more.
            </p>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {step === 2 && (
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
            )}
            {step === 1 ? (
              <Button
                onClick={() => setStep(2)}
                disabled={
                  !formData.title ||
                  !formData.description ||
                  !formData.problemSolved ||
                  !formData.category
                }
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !canAfford ||
                  formData.techStack.length === 0 ||
                  !formData.liveUrl
                }
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Submit Project
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
