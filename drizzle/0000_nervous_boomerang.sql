CREATE TABLE "designs" (
	"id" serial PRIMARY KEY NOT NULL,
	"design_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "design_id_idx" ON "designs" USING btree ("design_id");--> statement-breakpoint
CREATE INDEX "email_idx" ON "designs" USING btree ("email");