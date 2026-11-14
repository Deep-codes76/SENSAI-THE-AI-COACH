/**
 * PDF export.
 *
 * Two problems with the original implementation:
 *
 * 1. `html2pdf.js` was imported at module scope in a client component. Client
 *    components still render on the server, and the library touches `window`
 *    at import time, so the page crashed during SSR. It is now imported
 *    lazily, inside the click handler, in the browser only.
 *
 * 2. The source node lived inside a `.hidden` (display:none) wrapper.
 *    html2canvas measures layout, and a display:none subtree has none, so the
 *    exported file was blank. The node is now positioned off-screen instead,
 *    which keeps it laid out and rasterisable.
 */

const BASE_OPTIONS = {
  image: { type: "jpeg", quality: 0.98 },
  html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
  jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  pagebreak: { mode: ["avoid-all", "css", "legacy"] },
};

export async function exportElementToPdf(element, { filename, margin = [15, 15] }) {
  if (typeof window === "undefined") {
    throw new Error("PDF export is only available in the browser");
  }

  if (!element) {
    throw new Error("Nothing to export yet");
  }

  if (!element.offsetHeight) {
    throw new Error("The document is still rendering — try again in a moment");
  }

  const { default: html2pdf } = await import("html2pdf.js/dist/html2pdf.min.js");

  await html2pdf()
    .set({ ...BASE_OPTIONS, margin, filename })
    .from(element)
    .save();
}

/** Strip characters that are illegal in filenames on Windows and macOS. */
export function toSafeFilename(value, fallback = "document") {
  const cleaned = String(value || "")
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return (cleaned || fallback).slice(0, 80);
}
