function pgErrorCandidate(error: unknown): Record<string, unknown> | undefined {
  if (typeof error !== "object" || error === null) return undefined;

  const cause = "cause" in error ? (error as { cause?: unknown }).cause : undefined;
  const candidate = cause ?? error;

  return typeof candidate === "object" && candidate !== null
    ? (candidate as Record<string, unknown>)
    : undefined;
}

/** Extracts the Postgres error code (e.g. "23505" unique_violation) from a thrown Drizzle/postgres error. */
export function pgErrorCode(error: unknown): string | undefined {
  const code = pgErrorCandidate(error)?.code;
  return typeof code === "string" ? code : undefined;
}

/** Extracts the violated constraint name (e.g. for a 23503/23505 error) from a thrown Drizzle/postgres error. */
export function pgConstraintName(error: unknown): string | undefined {
  const name = pgErrorCandidate(error)?.constraint_name;
  return typeof name === "string" ? name : undefined;
}
