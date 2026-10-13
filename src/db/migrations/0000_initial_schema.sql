CREATE TABLE IF NOT EXISTS "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"empresa" text,
	"segmento" text,
	"mensagem" text NOT NULL,
	"origem" text DEFAULT 'site',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "analises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"score" integer,
	"classificacao" text,
	"justificativa" text,
	"resposta_sugerida" text,
	"modelo" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "analises" ADD CONSTRAINT "analises_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_leads_created_at" ON "leads" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_analises_lead_id" ON "analises" USING btree ("lead_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_analises_created_at" ON "analises" USING btree ("created_at");

