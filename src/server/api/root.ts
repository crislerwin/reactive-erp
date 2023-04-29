import { createTRPCRouter } from "@/server/api/trpc";
import { personRouter } from "./routers/person/persons";
import { companiesRouter } from "./routers/companies/companies";

export const appRouter = createTRPCRouter({
  person: personRouter,
  company: companiesRouter,
});

export type AppRouter = typeof appRouter;
