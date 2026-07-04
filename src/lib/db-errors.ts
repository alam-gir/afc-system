/** Extracts the Postgres error code (e.g. "23505" unique_violation) from a thrown Drizzle/postgres error. */
export function pgErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;

  const cause = "cause" in error ? (error as { cause?: unknown }).cause : undefined;
  const candidate = cause ?? error;

  if (typeof candidate === "object" && candidate !== null && "code" in candidate) {
    const code = (candidate as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }

  return undefined;
}
