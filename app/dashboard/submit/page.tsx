"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  FolderPlus, 
  Coins, 
  AlertCircle, 
  Upload,
  Link as LinkIcon,
  Github,
  Layers,
  Tag,
  FileText,
  Lightbulb,
  CheckCircle2,
  Loader2,
  X,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useCredits } from "@/components/dashboard/dashboard-layout";

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
  "React", "Next.js", "Vue", "Angular", "Svelte",
  "Node.js", "Python", "Go", "Rust", "TypeScript",
  "JavaScript", "TailwindCSS", "PostgreSQL", "MongoDB",
  "Redis", "AWS", "Vercel", "Docker", "GraphQL", "REST API"
];

export default function SubmitProjectPage() {
  const router = useRouter();
  const { credits, refreshCredits } = useCredits();
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
    screenshotUrl: "",
  });
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");

  const requiredCredits = 1;
  const hasEnoughCredits = credits >= requiredCredits;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addTech = (tech: string) => {
    if (!selectedTech.includes(tech) && selectedTech.length < 10) {
      setSelectedTech(prev => [...prev, tech]);
      setTechInput("");
    }
  };

  const removeTech = (tech: string) => {
    setSelectedTech(prev => prev.filter(t => t !== tech));
  };

  const handleTechKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && techInput.trim()) {
      e.preventDefault();
      addTech(techInput.trim());
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "project-screenshot");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, screenshotUrl: data.url }));
        toast.success("Screenshot uploaded!");
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload screenshot");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasEnoughCredits) {
      toast.error("Not enough credits to submit a project");
      return;
    }

    // Validate required fields
    if (!formData.title || !formData.description || !formData.problemSolved || !formData.liveUrl || !formData.category || selectedTech.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate URL format
    try {
      new URL(formData.liveUrl);
      if (formData.githubUrl) new URL(formData.githubUrl);
    } catch {
      toast.error("Please enter valid URLs");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          techStack: selectedTech,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit project");
      }

      toast.success("Project submitted successfully!");
      refreshCredits();
      router.push("/dashboard/projects");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FolderPlus className="h-6 w-6 text-blue-600" />
          Submit Project
        </h1>
        <p className="text-muted-foreground mt-1">
          Share your project and receive quality feedback from real makers
        </p>
      </div>

      {/* Credit check */}
      {!hasEnoughCredits && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <CardContent className="flex items-start gap-4 pt-6">
            <div className="rounded-full bg-amber-100 dark:bg-amber-800/50 p-2">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-amber-800 dark:text-amber-200">
                Not enough credits
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                You need {requiredCredits} credit to submit a project. You currently have{" "}
                <span className="font-semibold">{credits} credits</span>.
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
                Earn credits by reviewing other projects in the review queue.
              </p>
              <Button asChild variant="outline" className="mt-4 border-amber-300 dark:border-amber-700">
                <Link href="/dashboard/reviews">Go to Review Queue</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost indicator */}
      <Card className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <Coins className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Submission Cost</p>
                <p className="text-sm text-muted-foreground">Your project will receive 3 reviews</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{requiredCredits} Credit</p>
              <p className="text-sm text-muted-foreground">Balance: {credits} credits</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project submission form */}
      <form onSubmit={handleSubmit}>
        <Card className={!hasEnoughCredits ? "opacity-50 pointer-events-none" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Project Details
            </CardTitle>
            <CardDescription>
              Tell us about your project. Be specific to get better feedback.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                Project Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., TaskFlow - AI-powered project management"
                className="h-11"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what your project does and its key features..."
                className="min-h-28 resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/1000 characters
              </p>
            </div>

            {/* Problem Solved */}
            <div className="space-y-2">
              <Label htmlFor="problemSolved" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                What problem does it solve? <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="problemSolved"
                name="problemSolved"
                value={formData.problemSolved}
                onChange={handleChange}
                placeholder="What pain point or need does your project address? Who is your target user?"
                className="min-h-24 resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {formData.problemSolved.length}/500 characters
              </p>
            </div>

            {/* URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="liveUrl" className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Live URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="liveUrl"
                  name="liveUrl"
                  type="url"
                  value={formData.liveUrl}
                  onChange={handleChange}
                  placeholder="https://yourproject.com"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="githubUrl" className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub URL (optional)
                </Label>
                <Input
                  id="githubUrl"
                  name="githubUrl"
                  type="url"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/user/repo"
                  className="h-11"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a category" />
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
              <Label className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Tech Stack <span className="text-red-500">*</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {selectedTech.length}/10 selected
                </span>
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTech.map((tech) => (
                  <Badge key={tech} variant="secondary" className="gap-1 pr-1">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTech(tech)}
                      className="ml-1 rounded-full p-0.5 hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={handleTechKeyDown}
                placeholder="Type or select technologies..."
                className="h-11"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {TECH_OPTIONS.filter(t => !selectedTech.includes(t)).slice(0, 10).map((tech) => (
                  <Badge
                    key={tech}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => addTech(tech)}
                  >
                    + {tech}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Screenshot Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Project Screenshot (optional)
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleScreenshotUpload}
                className="hidden"
              />
              {formData.screenshotUrl ? (
                <div className="relative rounded-xl border border-border overflow-hidden">
                  <Image
                    src={formData.screenshotUrl}
                    alt="Project screenshot"
                    width={800}
                    height={400}
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData(prev => ({ ...prev, screenshotUrl: "" }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-muted-foreground transition-colors"
                >
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload a screenshot
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Your project will be reviewed by 3 makers
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || !hasEnoughCredits}
                className="min-w-32 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Submit Project
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
