-- Row Level Security on every game table, with NO policies.
-- The app reaches Postgres through the server-side connection, which bypasses
-- RLS. The public anon/authenticated keys therefore cannot read or write any
-- game data.
ALTER TABLE "game"."users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "game"."sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "game"."progress" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "game"."scores" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "game"."login_attempts" ENABLE ROW LEVEL SECURITY;
