"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const imageRef = useRef(null);

  useEffect(() => {
    const element = imageRef.current;
    if (!element) return;

    // rAF-throttled: the original handler ran layout-affecting class writes on
    // every scroll event, which janked the whole page on a trackpad.
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        element.classList.toggle("is-flat", window.scrollY > 100);
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-44">
      {/* Warm bloom behind the headline, theme-aware rather than a flat tint. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[32rem] w-[52rem] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, hsl(var(--primary) / 0.22), transparent 70%)",
        }}
      />

      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <p
            className="reveal section-label inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1.5"
            style={{ animationDelay: "40ms" }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Powered by Gemini
          </p>

          <h1
            className="reveal display-title mt-7 text-balance text-5xl leading-[0.95] md:text-7xl lg:text-[5.25rem]"
            style={{ animationDelay: "120ms" }}
          >
            Job hunting,
            <br />
            turned into{" "}
            <span className="relative inline-block">
              <span className="accent-text italic">practice</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 220 14"
                className="absolute -bottom-1 left-0 h-3 w-full text-primary/45"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 10C55 4 120 2 218 7"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p
            className="reveal mx-auto mt-8 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg"
            style={{ animationDelay: "220ms" }}
          >
            Sensai reads your industry, scores your resume the way an ATS does,
            writes cover letters for the posting in front of you, and runs mock
            interviews until the answers come easily.
          </p>

          <div
            className="reveal mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "320ms" }}
          >
            <Button asChild size="lg" className="group h-12 px-7 text-base">
              <Link href="/dashboard">
                Start free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 px-7 text-base"
            >
              <Link href="#how-it-works">
                <Play className="mr-2 h-3.5 w-3.5" />
                See how it works
              </Link>
            </Button>
          </div>
        </div>

        <div className="hero-frame mx-auto mt-16 max-w-5xl md:mt-20">
          <div ref={imageRef} className="hero-tilt">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
              {/* Window chrome, so the screenshot reads as an app not a photo. */}
              <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
                <span className="ml-3 font-mono text-[0.7rem] text-muted-foreground">
                  sensai.app/dashboard
                </span>
              </div>
              {/*
                An actual screenshot of the running dashboard, replacing the
                stock AI illustration the template shipped with.
              */}
              <Image
                src="/preview-dashboard.jpg"
                width={2880}
                height={1760}
                alt="The Sensai industry insights dashboard, showing market outlook, growth rate, demand level and salary ranges by role"
                className="w-full"
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
