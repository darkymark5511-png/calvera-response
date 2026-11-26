CREATE SCHEMA "game";
--> statement-breakpoint
CREATE TABLE "game"."login_attempts" (
	"key" text PRIMARY KEY NOT NULL,
	"fail_count" integer DEFAULT 0 NOT NULL,
	"window_start" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game"."progress" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game"."scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"username_snapshot" text,
	"mission" integer,
	"score" integer,
	"time_sec" integer,
	"rank" text,
	"outcome" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game"."sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "game"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"display_name" text,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'player' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "game"."progress" ADD CONSTRAINT "progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "game"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game"."scores" ADD CONSTRAINT "scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "game"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "game"."users"("id") ON DELETE no action ON UPDATE no action;