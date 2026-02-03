"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User,
  Briefcase,
  Code,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Camera,
  X,
  Search,
  Check,
  Globe,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface Position {
  id: string;
  name: string;
}

interface UserData {
  name: string;
  avatarUrl: string | null;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form data
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [position, setPosition] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Skills data
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // Check auth and load initial data
  useEffect(() => {
    async function init() {
      try {
        // Check session
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();

        if (!sessionData.authenticated) {
          router.push("/sign-in");
          return;
        }

        // If already onboarded, redirect to home
        if (sessionData.user?.onboardingCompleted) {
          router.push("/");
          return;
        }

        // Pre-fill name if available from OAuth
        if (sessionData.user?.name) {
          setName(sessionData.user.name);
        }
        if (sessionData.user?.avatarUrl) {
          setAvatarUrl(sessionData.user.avatarUrl);
          setAvatarPreview(sessionData.user.avatarUrl);
        }

        // Load skills and positions
        const [skillsRes, positionsRes] = await Promise.all([
          fetch("/api/skills"),
          fetch("/api/skills?type=positions"),
        ]);

        const skillsData = await skillsRes.json();
        const positionsData = await positionsRes.json();

        setAllSkills(skillsData.skills || []);
        setCategories(skillsData.categories || []);
        setPositions(positionsData.positions || []);
      } catch (error) {
        console.error("Init error:", error);
        toast.error("Something went wrong");
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [router]);

  // Filter skills based on search and category
  const filteredSkills = allSkills.filter((skill) => {
    const matchesSearch =
      skillSearch === "" ||
      skill.name.toLowerCase().includes(skillSearch.toLowerCase());
    const matchesCategory =
      !selectedCategory || skill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG, WebP, or GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setAvatarUrl(data.url);
      toast.success("Avatar uploaded!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
      setAvatarPreview(avatarUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleSkill = useCallback((skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId]
    );
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim() || null,
          website: website.trim() || null,
          position: position,
          skills: selectedSkills,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      toast.success("Profile complete! Welcome to Revlio 🎉");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedStep1 = name.trim().length >= 2;
  const canProceedStep2 = position !== "";
  const canProceedStep3 = selectedSkills.length >= 1;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Image
              src="/revlio_logo.png"
              alt="Revlio"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <span className="text-2xl font-semibold text-gray-900 dark:text-white">
              Revlio
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Complete your profile
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Help us personalize your experience
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-16 rounded-full transition-colors ${
                s === step
                  ? "bg-blue-600"
                  : s < step
                  ? "bg-blue-400"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="flex-1 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/90 dark:bg-gray-900/80 p-8 shadow-xl shadow-blue-900/5 dark:shadow-black/20 backdrop-blur">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-blue-600">
                <User className="h-5 w-5" />
                <span className="font-medium">Basic Information</span>
              </div>

              {/* Avatar Upload */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-800">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Avatar"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="avatar"
                    className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
                  >
                    <Camera className="h-4 w-4" />
                  </label>
                  <input
                    type="file"
                    id="avatar"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Click to upload (optional)
                </p>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                  Display Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-gray-700 dark:text-gray-300">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us a bit about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="resize-none border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  maxLength={300}
                />
                <p className="text-xs text-gray-400 text-right">
                  {bio.length}/300
                </p>
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website" className="text-gray-700 dark:text-gray-300">
                  Website / Portfolio
                </Label>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="website"
                    placeholder="https://yoursite.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Position */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-blue-600">
                <Briefcase className="h-5 w-5" />
                <span className="font-medium">What do you do?</span>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select your current role or position
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {positions.map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => setPosition(pos.id)}
                    className={`rounded-xl border-2 p-4 text-left transition-all ${
                      position === pos.id
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        position === pos.id
                          ? "text-blue-600"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {pos.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Skills */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-blue-600">
                <Code className="h-5 w-5" />
                <span className="font-medium">Your Tech Stack</span>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select the technologies you work with (at least 1)
              </p>

              {/* Selected skills */}
              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skillId) => {
                    const skill = allSkills.find((s) => s.id === skillId);
                    if (!skill) return null;
                    return (
                      <span
                        key={skillId}
                        className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-sm text-blue-700 dark:text-blue-300"
                      >
                        {skill.name}
                        <button
                          type="button"
                          onClick={() => toggleSkill(skillId)}
                          className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search skills..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  className="h-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-10"
                />
              </div>

              {/* Category filters */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    !selectedCategory
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      selectedCategory === cat
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Skills grid */}
              <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 p-2">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {filteredSkills.slice(0, 50).map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className={`flex items-center justify-between rounded-lg border p-2 text-left text-sm transition-all ${
                        selectedSkills.includes(skill.id)
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <span
                        className={
                          selectedSkills.includes(skill.id)
                            ? "text-blue-600"
                            : "text-gray-700 dark:text-gray-300"
                        }
                      >
                        {skill.name}
                      </span>
                      {selectedSkills.includes(skill.id) && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-center text-xs text-gray-400">
                {selectedSkills.length} skill{selectedSkills.length !== 1 && "s"} selected
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2)
              }
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceedStep3 || isSubmitting}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Complete Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
