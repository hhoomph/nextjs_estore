/**
 * Module for not-found
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import Link from "next/link";

// Force dynamic rendering to avoid prerendering issues
export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        404 - Page Not Found
      </h1>
      <p>The page you are looking for does not exist.</p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#3b82f6",
          color: "white",
          textDecoration: "none",
          borderRadius: "0.375rem",
        }}
      >
        Go Home
      </Link>
    </div>
  );
}
