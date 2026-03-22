import { ConvexError } from "convex/values";

/** Map Convex Auth / Password provider errors to readable UI text */
export function formatAuthError(err: unknown): string {
  let msg: string;
  if (err instanceof ConvexError) {
    const d = err.data as { message?: string } | string | undefined;
    if (typeof d === "object" && d !== null && typeof d.message === "string") {
      msg = d.message;
    } else {
      msg = String(d ?? err);
    }
  } else if (err instanceof Error) {
    msg = err.message;
  } else {
    msg = String(err);
  }

  if (msg === "InvalidAccountId" || msg.includes("InvalidAccountId")) {
    return "No account for this email. Sign up first, or check spelling and spaces.";
  }
  if (msg === "InvalidSecret" || msg.includes("InvalidSecret")) {
    return "Wrong password.";
  }
  if (msg === "TooManyFailedAttempts" || msg.includes("TooManyFailedAttempts")) {
    return "Too many attempts. Try again later.";
  }
  if (msg.includes("JWT_PRIVATE_KEY") || msg.includes("JWKS")) {
    return "Server auth keys missing. Run `node scripts/generate-auth-keys.mjs` then `npx convex env set --from-file .env.auth` and restart `npx convex dev`.";
  }
  if (msg.includes("CONVEX_SITE_URL")) {
    return "Set CONVEX_SITE_URL in the Convex dashboard (your *.convex.site URL) and restart `npx convex dev`.";
  }
  return msg;
}
