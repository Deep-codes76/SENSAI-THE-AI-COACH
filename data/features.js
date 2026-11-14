import { BrainCircuit, FileCheck2, LineChart, ScrollText } from "lucide-react";

/**
 * Icons are stored as components, not rendered elements, so the consuming
 * section controls sizing and colour rather than every data file repeating
 * the same Tailwind classes.
 */
export const features = [
  {
    icon: LineChart,
    title: "Live industry insights",
    description:
      "Salary bands, demand level, growth rate and the skills your market is actually hiring for — refreshed weekly by a scheduled job.",
    href: "/dashboard",
  },
  {
    icon: ScrollText,
    title: "Resume builder",
    description:
      "A structured editor that round-trips to markdown, so you can work in form fields or raw markdown and export a clean PDF.",
    href: "/resume",
  },
  {
    icon: FileCheck2,
    title: "ATS scoring",
    description:
      "Score your resume the way an applicant tracking system reads it, with concrete fixes and the keywords you are missing.",
    href: "/resume",
  },
  {
    icon: BrainCircuit,
    title: "Mock interviews",
    description:
      "Ten role-specific questions at a time, with explanations, a scored history and a tip generated from what you got wrong.",
    href: "/interview",
  },
];
