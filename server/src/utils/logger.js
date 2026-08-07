/**
 * Minimal logger wrapper. Kept deliberately tiny for now — the point isn't
 * the implementation, it's that every file logs through `logger.*` instead
 * of raw `console.*`. That means swapping in Winston/Pino later (Step 16:
 * Security & production hardening) is a one-file change, not a find/replace
 * across the whole codebase.
 */
const timestamp = () => new Date().toISOString();

export const logger = {
  info: (msg) => console.log(`[INFO]  ${timestamp()} ${msg}`),
  warn: (msg) => console.warn(`[WARN]  ${timestamp()} ${msg}`),
  error: (msg) => console.error(`[ERROR] ${timestamp()} ${msg}`),
};
