/**
 * An off-screen, fully laid-out container for PDF rasterisation.
 *
 * `display: none` would be simpler but produces a blank capture, because
 * html2canvas needs real layout boxes to paint.
 */
export function PrintSurface({ id, children }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: "-10000px",
        width: "794px", // A4 at 96dpi
        pointerEvents: "none",
        zIndex: -1,
      }}
    >
      <div
        id={id}
        style={{
          background: "#ffffff",
          color: "#111111",
          padding: "32px",
          width: "794px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default PrintSurface;
