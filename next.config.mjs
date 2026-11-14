/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lint errors used to be ignored at build time, which is how a broken
  // eslint setup went unnoticed. CI runs lint explicitly; keep builds honest.
  eslint: { dirs: ["app", "components", "lib", "actions", "hooks", "data"] },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // MDEditor and html2pdf are the two heaviest client deps; let Next split
    // them out rather than bundling them into the shared chunk.
    optimizePackageImports: ["lucide-react", "date-fns", "recharts"],
  },
};

export default nextConfig;
