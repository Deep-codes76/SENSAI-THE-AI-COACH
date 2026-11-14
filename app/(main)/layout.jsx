export default function MainLayout({ children }) {
  // Offset for the fixed header; the old `mt-24` guessed at it and left the
  // first heading tucked under the nav on short viewports.
  return <div className="container pb-24 pt-28 md:pt-32">{children}</div>;
}
