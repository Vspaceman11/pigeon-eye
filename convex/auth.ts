import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { DataModel } from "./_generated/dataModel";

/** Same key for sign-up and sign-in (Convex Auth matches authAccounts by this string). */
function normalizeEmail(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.trim().toLowerCase();
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password<DataModel>({
      profile(params, _ctx) {
        const email = normalizeEmail(params.email);
        if (!email) {
          throw new Error("Email is required");
        }
        const rawName = typeof params.name === "string" ? params.name.trim() : "";
        const name = rawName || email.split("@")[0] || "User";
        const now = new Date().toISOString();
        return {
          name,
          email,
          total_points: 0,
          role: "citizen" as const,
          created_at: now,
        };
      },
    }),
  ],
});
