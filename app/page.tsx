"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Lenis from "lenis";
import {
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  MessageSquare,
  Users,
  Zap,
  Shield,
  Trophy,
  Star,
  CheckCircle2,
  HeartHandshake,
  Layers,
  Send,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

// ===== LENIS SMOOTH SCROLL PROVIDER =====
function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);
}

// ===== MESH GRADIENT BACKGROUND =====
function MeshGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Blue-tinted gradient mesh */}
      <div 
        className="absolute inset-0 opacity-70"
        style={{
          background: `
            radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
            radial-gradient(at 100% 0%, rgba(99, 102, 241, 0.06) 0%, transparent 50%),
            radial-gradient(at 100% 100%, rgba(14, 165, 233, 0.05) 0%, transparent 50%),
            radial-gradient(at 0% 100%, rgba(139, 92, 246, 0.04) 0%, transparent 50%)
          `
        }}
      />
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} 
      />
    </div>
  );
}

// ===== DOT PATTERN =====
function DotPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" className="text-blue-950/5 dark:text-blue-100/5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  );
}

// ===== NAVIGATION COMPONENT =====
function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "FAQs", href: "#faq" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4">
        <nav
          className={cn(
            "flex items-center justify-between transition-all duration-300",
            isScrolled
              ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-100/40 dark:border-blue-900/20 rounded-full shadow-sm px-6 py-2.5"
              : "bg-transparent py-2"
          )}
        >
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5">
            <Image
              src="/revlio_logo.png"
              alt="Revlio"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Revlio
            </span>
          </a>

          {/* Desktop Nav - Center */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600/80 dark:hover:text-blue-400/80 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Button
              asChild
              className="hidden sm:inline-flex rounded-full bg-blue-600/90 text-white hover:bg-blue-700/90 px-5 h-9 text-sm font-medium shadow-none"
            >
              <a href="#early-access">Join Waitlist</a>
            </Button>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-blue-50/60 dark:hover:bg-blue-950/20 transition-colors"
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileOpen && (
          <div className="md:hidden mt-2 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600/80 dark:hover:text-blue-400/80 hover:bg-blue-50/60 dark:hover:bg-blue-950/20 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-800">
                <Button asChild className="w-full rounded-full bg-blue-600/90 text-white hover:bg-blue-700/90">
                  <a href="#early-access">Join Waitlist</a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// ===== HERO SECTION =====
function HeroSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setEmail("");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 overflow-hidden">
      <MeshGradient />
      <DotPattern />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">
        {/* Announcement Badge with Shimmer */}
        <a 
          href="#early-access"
          className="group relative inline-flex items-center gap-2 rounded-full border border-blue-200/60 dark:border-blue-800/60 bg-white dark:bg-gray-900 px-4 py-1.5 text-sm font-medium mb-8 hover:border-blue-300/70 dark:hover:border-blue-700/60 transition-colors overflow-hidden shadow-sm"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-blue-100/40 dark:via-blue-400/10 to-transparent" />
          <span className="relative flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400/70 opacity-70" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500/80" />
            </span>
            <span className="text-gray-700 dark:text-gray-300">Early Access Now Open</span>
            <span className="text-gray-400">—</span>
            <span className="text-blue-600/80 dark:text-blue-400/80 font-semibold">Join the Waitlist</span>
          </span>
        </a>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold tracking-tight leading-[1.1] mb-6 text-gray-900 dark:text-white">
          Get Real Feedback,
          <br />
          Not Fake Likes
        </h1>

        {/* Subheadline */}
        <p className="mx-auto max-w-2xl text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed">
          The feedback economy for builders. Earn credits by reviewing others,
          spend them to get{" "}
          <span className="text-blue-600/80 dark:text-blue-400/80 font-medium">
            guaranteed, structured feedback
          </span>{" "}
          on your projects.
        </p>

        {/* Email Form Card */}
        <div id="early-access" className="mx-auto max-w-md">
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-xl shadow-blue-900/5 dark:shadow-black/20">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Get Early Access
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Be the first to know when we launch.
            </p>

            {isSubmitted ? (
              <div className="flex items-center gap-3 py-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100/70 dark:bg-blue-900/30">
                  <CheckCircle2 className="w-5 h-5 text-blue-600/80 dark:text-blue-400/80" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">You&apos;re on the list!</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">We&apos;ll be in touch soon.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 pl-4 pr-4 text-base bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500/70"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl bg-blue-600/90 text-white hover:bg-blue-700/90 font-medium"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Joining...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Join Waitlist</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-5 h-5 text-blue-500/60" />
      </div>
    </section>
  );
}

// ===== PROBLEM SECTION =====
function ProblemSection() {
  const problems = [
    {
      icon: Users,
      title: "Attention Inequality",
      description:
        "Only developers with existing audiences get feedback. New builders are ignored—not because their work is bad, but because distribution is unfair.",
    },
    {
      icon: HeartHandshake,
      title: "Motivation Drop-off",
      description:
        "Zero comments, no reviews, no real reactions. You start questioning: Is my work useless? Should I stop building?",
    },
    {
      icon: MessageSquare,
      title: "Fake Engagement",
      description:
        "\"Nice project bro 🔥\" doesn't help you improve. You need honest critique and actionable suggestions, not empty validation.",
    },
  ];

  return (
    <section id="features" className="relative py-24 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 px-4 py-1.5 text-xs font-medium uppercase tracking-wider border-blue-200/60 dark:border-blue-800/60 text-blue-600/80 dark:text-blue-400/80 rounded-full"
          >
            The Problem
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
            Social Platforms Are Broken
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            You deserve better than screaming into the void. Here&apos;s why current
            platforms fail builders like you.
          </p>
        </div>

        {/* Problem Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-200/60 dark:hover:border-blue-800/60 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-blue-500/5"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 mb-5 group-hover:bg-blue-100/60 dark:group-hover:bg-blue-900/40 transition-colors">
                <problem.icon className="w-5 h-5 text-blue-600/80 dark:text-blue-400/80" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                {problem.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-[15px]">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== HOW IT WORKS SECTION =====
function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: MessageSquare,
      title: "Review Projects",
      description:
        "Give structured, helpful feedback to other developers' projects. Each quality review earns you credits.",
    },
    {
      number: "02",
      icon: Send,
      title: "Submit Your Project",
      description:
        "Use your earned credits to submit your own project for review. No credits = no submissions.",
    },
    {
      number: "03",
      icon: Award,
      title: "Get Guaranteed Feedback",
      description:
        "Every project gets assigned to 3+ reviewers automatically. No project is ever left behind.",
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-14">
          <Badge
            variant="outline"
            className="mb-4 px-4 py-1.5 text-xs font-medium uppercase tracking-wider border-blue-200/60 dark:border-blue-800/60 text-blue-600/75 dark:text-blue-400/75 rounded-full"
          >
            How It Works
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4 text-gray-900 dark:text-white">
            Simple. <span className="text-blue-600/80 dark:text-blue-400/80">Fair.</span> Effective.
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A contribution economy that rewards quality: give feedback to get
            feedback.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800/70 p-6 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-11 h-11 rounded-full border border-gray-200/70 dark:border-gray-700/70 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-blue-600/80 dark:text-blue-400/80" />
                </div>
                <div className="text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                  STEP {step.number}
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                {step.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== BENEFITS SECTION =====
function BenefitsSection() {
  const benefits = [
    {
      icon: Shield,
      title: "Guaranteed Minimum Feedback",
      description:
        "Every project gets at least 3 structured reviews. No project is ignored.",
    },
    {
      icon: Users,
      title: "Earned Visibility",
      description:
        "Visibility based on contribution, not followers. Fair exposure for all builders.",
    },
    {
      icon: MessageSquare,
      title: "Structured Feedback Format",
      description:
        "Reviews follow a clear format: what's good, what's unclear, improvement suggestions.",
    },
    {
      icon: Zap,
      title: "Credit Economy",
      description:
        "Give to get. Earn credits by reviewing, spend them to get your projects reviewed.",
    },
    {
      icon: Trophy,
      title: "Weekly Highlights",
      description:
        "Top projects and contributors get featured. Quality rises to the top.",
    },
    {
      icon: Star,
      title: "Builder Community",
      description:
        "Connect with other indie developers. Build reputation through consistent contribution.",
    },
  ];

  return (
    <section className="relative py-24 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 px-4 py-1.5 text-xs font-medium uppercase tracking-wider border-blue-200/60 dark:border-blue-800/60 text-blue-600/80 dark:text-blue-400/80 rounded-full"
          >
            Why Revlio
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
            Built for Builders, by Builders
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            No vanity metrics—just real growth. A platform designed to help you
            ship better products.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-200/60 dark:hover:border-blue-800/60 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5"
            >
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 flex items-center justify-center group-hover:bg-blue-100/60 dark:group-hover:bg-blue-900/40 transition-colors">
                    <benefit.icon className="w-5 h-5 text-blue-600/80 dark:text-blue-400/80" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-gray-900 dark:text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== FAQ SECTION =====
function FAQSection() {
  const faqs = [
    {
      question: "What is Revlio?",
      answer:
        "Revlio is a feedback economy platform for indie developers and builders. Instead of posting your project and hoping for feedback, you earn credits by reviewing others' projects, then spend those credits to get guaranteed, structured feedback on your own work.",
    },
    {
      question: "How does the credit system work?",
      answer:
        "You earn credits by providing quality reviews to other developers' projects. Each review earns you 1+ credits based on quality. Submitting a project costs 2 credits. You can also boost your project for more visibility by spending additional credits.",
    },
    {
      question: "Is Revlio free to use?",
      answer:
        "Yes! Revlio is free to use. There are no subscription fees. The platform runs on a contribution economy—you give feedback to get feedback. Premium features may be added in the future, but the core experience will always be free.",
    },
    {
      question: "How do I get started?",
      answer:
        "Join the early access waitlist by entering your email above. Once we launch, you'll be the first to get access. After signing up, complete your profile, review 2 projects to earn initial credits, then submit your own project for review.",
    },
    {
      question: "What makes the feedback structured?",
      answer:
        "Every review follows a three-part format: (1) What's good about the project, (2) What's unclear or confusing, and (3) One actionable improvement suggestion. This ensures every piece of feedback is useful and constructive.",
    },
    {
      question: "When will Revlio launch?",
      answer:
        "We're currently in early access preparation. Early access members will be invited in waves starting soon. Join the waitlist to be among the first to try Revlio!",
    },
  ];

  return (
    <section id="faq" className="relative py-24 px-4 sm:px-6 bg-gray-50/80 dark:bg-gray-950/50">
      <div className="mx-auto max-w-3xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge
            variant="outline"
            className="mb-4 px-4 py-1.5 text-xs font-medium uppercase tracking-wider border-blue-200/60 dark:border-blue-800/60 text-blue-600/80 dark:text-blue-400/80 rounded-full"
          >
            FAQ
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Everything you need to know about Revlio.
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-6 overflow-hidden data-[state=open]:border-blue-200/60 dark:data-[state=open]:border-blue-800/60 transition-colors"
            >
              <AccordionTrigger className="text-left font-medium py-5 hover:no-underline text-gray-900 dark:text-white">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400 pb-5 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

const CTA_SPARKLES = [
  { left: "12%", top: "18%", delay: "0.6s", duration: "3.2s" },
  { left: "28%", top: "30%", delay: "1.1s", duration: "2.8s" },
  { left: "44%", top: "22%", delay: "0.2s", duration: "3.6s" },
  { left: "62%", top: "16%", delay: "1.6s", duration: "3.1s" },
  { left: "78%", top: "28%", delay: "0.9s", duration: "2.7s" },
  { left: "18%", top: "62%", delay: "1.8s", duration: "3.4s" },
  { left: "36%", top: "70%", delay: "0.5s", duration: "2.9s" },
  { left: "54%", top: "64%", delay: "1.2s", duration: "3.3s" },
  { left: "72%", top: "68%", delay: "0.8s", duration: "2.6s" },
  { left: "88%", top: "60%", delay: "1.4s", duration: "3.0s" },
];

// ===== CTA SECTION =====
function CTASection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 overflow-hidden">
      {/* Shiny animated gradient background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, 
                rgba(99, 146, 216, 0.12) 0%,
                rgba(120, 165, 230, 0.10) 35%,
                rgba(140, 185, 240, 0.08) 70%,
                rgba(99, 146, 216, 0.12) 100%
              )
            `
          }}
        />
        {/* Animated shine overlay */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 50%, rgba(99, 146, 216, 0.18), transparent),
              radial-gradient(ellipse 60% 40% at 25% 70%, rgba(120, 165, 230, 0.12), transparent),
              radial-gradient(ellipse 60% 40% at 75% 30%, rgba(140, 185, 240, 0.12), transparent)
            `,
            animation: 'pulse 4s ease-in-out infinite'
          }}
        />
        {/* Sparkle dots */}
        <div className="absolute inset-0">
          {CTA_SPARKLES.map((sparkle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/20 rounded-full animate-pulse"
              style={{
                left: sparkle.left,
                top: sparkle.top,
                animationDelay: sparkle.delay,
                animationDuration: sparkle.duration
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-gray-200/70 dark:border-gray-800/70 mb-6 shadow-sm">
          <Image
            src="/revlio_logo.png"
            alt="Revlio"
            width={32}
            height={32}
            className="rounded-lg"
          />
        </div>
        
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
          Ready to Get Real Feedback?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-xl mx-auto">
          Join the waitlist and be the first to experience the feedback economy. 
          <span className="font-medium text-blue-600/75 dark:text-blue-400/75 ml-1">Always free, forever.</span>
        </p>

        {/* Button */}
        <Button
          asChild
          size="lg"
          className="rounded-full bg-blue-600/90 text-white hover:bg-blue-700/90 px-8 h-12 text-base font-medium shadow-lg shadow-blue-500/20"
        >
          <a href="#early-access">
            Join the Waitlist
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </div>
    </section>
  );
}

// ===== FOOTER =====
function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5">
            <Image
              src="/revlio_logo.png"
              alt="Revlio"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Revlio</span>
          </a>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <a href="#features" className="hover:text-blue-600/80 dark:hover:text-blue-400/80 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-blue-600/80 dark:hover:text-blue-400/80 transition-colors">
              How It Works
            </a>
            <a href="#faq" className="hover:text-blue-600/80 dark:hover:text-blue-400/80 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Revlio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ===== MAIN PAGE =====
export default function Home() {
  // Initialize Lenis smooth scroll
  useLenis();

  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <BenefitsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
