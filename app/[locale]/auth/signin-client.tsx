// app/[locale]/auth/signin-client.tsx
// Stub client component for sign-in flow used by tests
"use client";

import * as React from "react";

export interface SignInClientProps {
  callbackUrl?: string;
  socialProviders?: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function SignInClient({
  callbackUrl,
  socialProviders = [],
  onSuccess,
  onError,
}: SignInClientProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Sign-in logic would go here
      onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Sign-in failed");
      setError(error.message);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="signin-form">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        data-testid="email-input"
        aria-label="Email"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        data-testid="password-input"
        aria-label="Password"
      />
      <button type="submit" disabled={loading} data-testid="submit-btn">
        {loading ? "Signing in..." : "Sign In"}
      </button>
      {error && <div role="alert">{error}</div>}
      {socialProviders.length > 0 && (
        <div data-testid="social-providers">
          {socialProviders.map((provider) => (
            <button
              key={provider.id}
              type="button"
              data-testid={`social-${provider.id}`}
            >
              Continue with {provider.name}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
