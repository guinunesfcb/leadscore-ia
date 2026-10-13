import { pgTable, uuid, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    nome: text("nome").notNull(),
    email: text("email").notNull(),
    empresa: text("empresa"),
    segmento: text("segmento"),
    mensagem: text("mensagem").notNull(),
    origem: text("origem").default("site"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_leads_created_at").on(table.created_at),
  ]
);

export const analises = pgTable(
  "analises",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    lead_id: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    score: integer("score"),
    classificacao: text("classificacao"), // 'quente' | 'morno' | 'frio'
    justificativa: text("justificativa"),
    resposta_sugerida: text("resposta_sugerida"),
    modelo: text("modelo"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_analises_lead_id").on(table.lead_id),
    index("idx_analises_created_at").on(table.created_at),
  ]
);

export const leadsRelations = relations(leads, ({ many }) => ({
  analises: many(analises),
}));

export const analisesRelations = relations(analises, ({ one }) => ({
  lead: one(leads, {
    fields: [analises.lead_id],
    references: [leads.id],
  }),
}));

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Analise = typeof analises.$inferSelect;
export type NewAnalise = typeof analises.$inferInsert;

