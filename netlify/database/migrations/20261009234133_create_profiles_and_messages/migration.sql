CREATE TABLE "admin_messages" (
	"id" serial PRIMARY KEY,
	"sender_email" text NOT NULL,
	"recipient_email" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY,
	"user_id" text NOT NULL UNIQUE,
	"email" text NOT NULL UNIQUE,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
