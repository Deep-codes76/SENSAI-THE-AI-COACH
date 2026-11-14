import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import HeroSection from "@/components/hero";
import Reveal from "@/components/reveal";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { features } from "@/data/features";
import { howItWorks } from "@/data/howItWorks";
import { faqs } from "@/data/faqs";
import { capabilities, techStack } from "@/data/techStack";

function SectionHeading({ index, label, title, description }) {
  return (
    <div className="mb-14 max-w-2xl">
      <div className="mb-5 flex items-center gap-4">
        <span className="seal font-mono text-xs text-primary">{index}</span>
        <span className="section-label">{label}</span>
      </div>
      <h2 className="text-balance text-3xl leading-tight md:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <HeroSection />

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="border-t border-border py-20 md:py-28">
        <div className="container">
          <SectionHeading
            index="01"
            label="What it does"
            title="Four tools, one profile."
            description="Onboarding happens once. Every tool below reads the same industry, experience and skills, so nothing has to be re-explained."
          />

          <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
            {features.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 70}>
                <Link
                  href={feature.href}
                  className="group flex h-full flex-col bg-card p-7 transition-colors hover:bg-muted/50 md:p-9"
                >
                  <div className="mb-6 flex items-start justify-between">
                    <feature.icon
                      className="h-7 w-7 text-primary"
                      strokeWidth={1.5}
                    />
                    <ArrowUpRight className="h-4 w-4 -translate-x-1 translate-y-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                  </div>
                  <h3 className="mb-3 text-xl md:text-2xl">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capability figures ───────────────────────────────────── */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((stat, index) => (
              <Reveal key={stat.label} delay={index * 60}>
                <div className="border-l-2 border-primary/40 pl-5">
                  <p className="numeric text-4xl font-semibold tracking-tight">
                    {stat.value}
                  </p>
                  <p className="mt-2 font-medium">{stat.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {stat.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section id="how-it-works" className="border-t border-border py-20 md:py-28">
        <div className="container">
          <SectionHeading
            index="02"
            label="The loop"
            title="Set up once, then practise."
          />

          <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
            {/* Connector rule, drawn behind the step markers. */}
            <span
              aria-hidden="true"
              className="absolute left-0 right-0 top-6 hidden h-px bg-border md:block"
            />
            {howItWorks.map((step, index) => (
              <Reveal key={step.title} delay={index * 80}>
                <li className="relative list-none">
                  <div className="relative z-10 mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background">
                    <step.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <p className="numeric mb-2 text-xs text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Under the hood ───────────────────────────────────────── */}
      <section className="border-t border-border bg-muted/30 py-20 md:py-28">
        <div className="container">
          <SectionHeading
            index="03"
            label="Under the hood"
            title="Built as a production app, not a demo."
            description="Server Actions for every mutation, validated AI output, scoped database queries, and a scheduled job that keeps market data current."
          />

          <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {techStack.map((item, index) => (
              <Reveal key={item.name} delay={index * 50}>
                <div className="h-full bg-card p-6">
                  <p className="font-mono text-sm font-medium text-primary">
                    {item.name}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.role}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="border-t border-border py-20 md:py-28">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <SectionHeading index="04" label="Questions" title="Good to know." />
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-pretty leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="border-t border-border py-20 md:py-28">
        <div className="container">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-16 text-center md:px-12 md:py-20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-56 opacity-70"
              style={{
                background:
                  "radial-gradient(closest-side, hsl(var(--primary) / 0.18), transparent)",
              }}
            />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-balance text-3xl leading-tight md:text-5xl">
                Your next interview is already on the calendar.
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-pretty text-muted-foreground">
                Set up your profile in under a minute and start practising.
              </p>
              <Button asChild size="lg" className="group mt-9 h-12 px-8 text-base">
                <Link href="/dashboard">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
