"use client";

/**
 * Catches failures in the root layout itself, where `app/error.jsx` cannot
 * render because its surrounding layout is the thing that failed. It must
 * therefore supply its own <html> and <body>.
 */
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#141210",
          color: "#f2ece4",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", margin: "0 0 12px" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#a89e92", margin: "0 0 24px" }}>
            {error?.message || "The application failed to load."}
          </p>
          <button
            onClick={reset}
            style={{
              background: "#f06a42",
              color: "#141210",
              border: 0,
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: "0.95rem",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
