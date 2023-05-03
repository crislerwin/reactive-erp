import { createTRPCRouter } from "@/server/api/trpc";
import { personRouter } from "./routers/person";
import { companiesRouter } from "./routers/company";

export const appRouter = createTRPCRouter({
  person: personRouter,
  company: companiesRouter,
});

export type AppRouter = typeof appRouter;
