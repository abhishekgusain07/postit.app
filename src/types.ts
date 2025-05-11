import { integration } from "./db/schema";

export type Integration = typeof integration.$inferSelect;
export type NewIntegration = typeof integration.$inferInsert;