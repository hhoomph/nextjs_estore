/**
 * SSR-safe crypto utilities
 *
 * Provides crypto functions that work in both server-side and client-side environments.
 * Uses Web Crypto API when available (browser), falls back to Node.js crypto module.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */

// Check if we're in a browser environment with Web Crypto API
const isWebCryptoAvailable =
  typeof window !== "undefined" &&
  typeof crypto !== "undefined" &&
  crypto.randomUUID;

/**
 * Get crypto object - throws error if not available
 */
export function getCrypto(): Crypto {
  if (!isWebCryptoAvailable) {
    throw new Error("Crypto API is not available in this environment");
  }
  return crypto;
}

/**
 * SSR-safe version of crypto.randomUUID()
 * Falls back to a simple UUID v4 implementation using Node.js crypto for server-side
 */
export function randomUUID(): string {
  if (isWebCryptoAvailable) {
    return crypto.randomUUID();
  }

  // Server-side fallback using Node.js crypto
  const nodeCrypto = require("crypto");
  return nodeCrypto.randomUUID();
}

/**
 * SSR-safe version of crypto.getRandomValues()
 * Falls back to Node.js crypto.randomBytes for server-side
 */
export function getRandomValues(array: Uint8Array): Uint8Array {
  if (isWebCryptoAvailable) {
    return crypto.getRandomValues(array);
  }

  // Server-side fallback using Node.js crypto
  const nodeCrypto = require("crypto");
  const buffer = nodeCrypto.randomBytes(array.length);
  array.set(new Uint8Array(buffer));
  return array;
}

/**
 * SSR-safe version of crypto.subtle.digest()
 * Falls back to Node.js crypto.createHash for server-side
 */
export async function subtleDigest(
  algorithm: string,
  data: Uint8Array,
): Promise<ArrayBuffer> {
  if (isWebCryptoAvailable) {
    // Type cast to bypass TypeScript strict typing issue
    return crypto.subtle.digest(algorithm, data as any);
  }

  // Server-side fallback using Node.js crypto
  const nodeCrypto = require("crypto");
  const hash = nodeCrypto.createHash(algorithm.toLowerCase().replace("-", ""));
  hash.update(data);
  const digest = hash.digest();
  return digest.buffer.slice(
    digest.byteOffset,
    digest.byteOffset + digest.byteLength,
  );
}

/**
 * Generate a secure random string using SSR-safe crypto
 */
export function generateSecureRandomString(length: number = 32): string {
  const array = new Uint8Array(length);
  getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

/**
 * Hash a string using SHA-256 with SSR-safe crypto
 */
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await subtleDigest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
