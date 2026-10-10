import type { Config, Context } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { db } from "../../db/index.js";
import { profiles, adminMessages } from "../../db/schema.js";
import { eq, desc, and, sql } from "drizzle-orm";

const normalizeEmail = (email: unknown) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

async function getOrCreateProfile(user: { id: string; email?: string; appMetadata?: any }) {
  const email = normalizeEmail(user.email);
  const [existing] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
  if (existing) return existing;

  // The very first account (or anyone with the Identity "admin" role) becomes an admin
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(profiles);
  // Admins may have granted access to this email before the person signed up
  const pendingGrants = await db
    .select()
    .from(adminMessages)
    .where(and(eq(adminMessages.recipientEmail, email), eq(adminMessages.status, "pending")));

  const isAdmin =
    count === 0 ||
    pendingGrants.length > 0 ||
    Boolean(user.appMetadata?.roles?.includes("admin"));

  const [profile] = await db
    .insert(profiles)
    .values({ userId: user.id, email, isAdmin })
    .onConflictDoUpdate({ target: profiles.email, set: { userId: user.id } })
    .returning();

  if (pendingGrants.length > 0) {
    await db
      .update(adminMessages)
      .set({ status: "approved" })
      .where(and(eq(adminMessages.recipientEmail, email), eq(adminMessages.status, "pending")));
  }
  return profile;
}

export default async (req: Request, context: Context) => {
  const { pathname } = new URL(req.url);
  const user = await getUser();

  if (pathname === "/api/auth/user") {
    if (!user) return Response.json({ user: null, profile: null });
    const profile = await getOrCreateProfile(user);
    return Response.json({
      user: { id: user.id, email: user.email, name: user.name },
      profile,
    });
  }

  if (!user) return new Response("Unauthorized", { status: 401 });
  const profile = await getOrCreateProfile(user);

  // Messages the signed-in user has received
  if (pathname === "/api/messages" && req.method === "GET") {
    const inbox = await db
      .select()
      .from(adminMessages)
      .where(eq(adminMessages.recipientEmail, profile.email))
      .orderBy(desc(adminMessages.createdAt));
    return Response.json(inbox);
  }

  if (!profile.isAdmin) {
    return new Response("Forbidden: Admin access required", { status: 403 });
  }

  // Admin: list sent admin messages, or send a new one that grants admin access
  if (pathname === "/api/admin/messages") {
    if (req.method === "GET") {
      const messages = await db.select().from(adminMessages).orderBy(desc(adminMessages.createdAt));
      return Response.json(messages);
    }

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const recipientEmail = normalizeEmail(body.recipientEmail);
      const message = typeof body.message === "string" ? body.message.trim().slice(0, 1000) : "";
      if (!isValidEmail(recipientEmail)) {
        return Response.json({ error: "Enter a valid email address." }, { status: 400 });
      }

      const [target] = await db.select().from(profiles).where(eq(profiles.email, recipientEmail));
      if (target) {
        await db.update(profiles).set({ isAdmin: true }).where(eq(profiles.id, target.id));
      }

      const [newMsg] = await db
        .insert(adminMessages)
        .values({
          senderEmail: profile.email,
          recipientEmail,
          message: message || "You have been given admin access to Chez Games.",
          // "pending" means the person hasn't signed up yet; it's applied when they do
          status: target ? "approved" : "pending",
        })
        .returning();
      return Response.json(newMsg, { status: 201 });
    }
  }

  // Admin: list members, or change someone's admin status
  if (pathname === "/api/admin/members") {
    if (req.method === "GET") {
      const members = await db.select().from(profiles).orderBy(desc(profiles.isAdmin), profiles.email);
      return Response.json(members);
    }

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const email = normalizeEmail(body.email);
      if (!email || typeof body.isAdmin !== "boolean") {
        return Response.json({ error: "Missing email or isAdmin." }, { status: 400 });
      }
      if (email === profile.email && !body.isAdmin) {
        return Response.json({ error: "You can't remove your own admin access." }, { status: 400 });
      }
      const [updated] = await db
        .update(profiles)
        .set({ isAdmin: body.isAdmin })
        .where(eq(profiles.email, email))
        .returning();
      if (!updated) return Response.json({ error: "Member not found." }, { status: 404 });
      if (!body.isAdmin) {
        // Cancel any grant still waiting to be applied
        await db
          .update(adminMessages)
          .set({ status: "revoked" })
          .where(and(eq(adminMessages.recipientEmail, email), eq(adminMessages.status, "pending")));
      }
      return Response.json(updated);
    }
  }

  return new Response("Not Found", { status: 404 });
};

export const config: Config = {
  path: ["/api/auth/user", "/api/messages", "/api/admin/messages", "/api/admin/members"],
};
