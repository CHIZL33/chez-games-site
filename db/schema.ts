import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: serial().primaryKey(),
  userId: text("user_id").notNull().unique(), // Netlify Identity user ID
  email: text().notNull().unique(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminMessages = pgTable("admin_messages", {
  id: serial().primaryKey(),
  senderEmail: text("sender_email").notNull(),
  recipientEmail: text("recipient_email").notNull(),
  message: text().notNull(),
  status: text().notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});
