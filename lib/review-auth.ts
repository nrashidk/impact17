// Single source of truth for "is this request an authorized reviewer?".
//
// v1 implementation: the same ADMIN_SEED_SECRET Bearer/secret check used by
// app/api/admin/scores/route.ts. There is no user role system yet.
//
// IMPORTANT: every reviewer entrypoint (queue page, approve/reject actions)
// MUST call ONLY this function and never inline a secret check. When a real
// role system is introduced, this is the ONE file to change — swapping the
// secret gate for a role lookup here is the entire migration.

// Accepts the secret from either an Authorization: Bearer header (API/route
// callers) or a `key` value (browser page navigation, since browsers can't
// set Authorization headers on a normal GET). Both compare to the single
// ADMIN_SEED_SECRET env var.
export function isAuthorizedReviewer(input: {
  bearer?: string | null;
  key?: string | null;
}): boolean {
  const expected = process.env.ADMIN_SEED_SECRET;
  if (!expected || expected.length === 0) return false;
  const fromBearer =
    input.bearer && input.bearer.startsWith("Bearer ")
      ? input.bearer.slice("Bearer ".length).trim()
      : null;
  const provided = fromBearer ?? (input.key ? input.key.trim() : null);
  return provided !== null && provided === expected;
}
