import { companiesRouter } from "./routes/company/company-routes";
import { personRouter } from "./routes/person/person-router";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  person: personRouter,
  company: companiesRouter,
});

export type AppRouter = typeof appRouter;
