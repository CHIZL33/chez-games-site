import type { Config, Context } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { db } from "../../db/index.js";
import { profiles, adminMessages } from "../../db/schema.js";
import { eq, desc } from "drizzle-orm";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // Get current authenticated user
  const user = await getUser();

  if (path === "/api/auth/user") {
    if (!user) {
      return Response.json({ user: null, profile: null });
    }
    // Check or create profile in database
    let [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
    if (!profile) {
      // If first user, make them admin, or check if email is admin
      const allProfiles = await db.select().from(profiles);
      const isFirst = allProfiles.length === 0;
      [profile] = await db.insert(profiles).values({
        userId: user.id,
        email: user.email!,
        isAdmin: isFirst || user.email === "admin@chez.games" || user.appMetadata?.roles?.includes("admin") || false,
      }).returning();
    }
    return Response.json({ 
      user: {
        id: user.id,
        email: user.email,
        userMetadata: user.userMetadata,
        appMetadata: user.appMetadata,
      }, 
      profile 
    });
  }

  if (path === "/api/admin/messages") {
    if (!user) return new Response("Unauthorized", { status: 401 });
    let [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
    if (!profile || !profile.isAdmin) {
      return new Response("Forbidden: Admin access required", { status: 403 });
    }

    if (req.method === "GET") {
      const messages = await db.select().from(adminMessages).orderBy(desc(adminMessages.createdAt));
      return Response.json(messages);
    }

    if (req.method === "POST") {
      const { id, status } = await req.json();
      if (!id || !status) return new Response("Missing id or status", { status: 400 });
      
      // Update message status
      const [updated] = await db.update(adminMessages).set({ status }).where(eq(adminMessages.id, id)).returning();
      
      if (status === "approved") {
        // Find profile with recipient email and make them admin
        const [targetProfile] = await db.select().from(profiles).where(eq(profiles.email, updated.recipientEmail));
        if (targetProfile) {
          await db.update(profiles).set({ isAdmin: true }).where(eq(profiles.id, targetProfile.id));
        }
      }
      return Response.json(updated);
    }
  }

  if (path === "/api/messages/send") {
    if (!user) return new Response("Unauthorized", { status: 401 });
    if (req.method === "POST") {
      const { recipientEmail, message } = await req.json();
      if (!recipientEmail || !message) return new Response("Missing fields", { status: 400 });

      const [newMsg] = await db.insert(adminMessages).values({
        senderEmail: user.email!,
        recipientEmail,
        message,
        status: "pending",
      }).returning();
      return Response.json(newMsg, { status: 201 });
    }
  }

  return new Response("Not Found", { status: 404 });
};

export const config: Config = {
  path: ["/api/auth/user", "/api/admin/messages", "/api/messages/send"],
};
