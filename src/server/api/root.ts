import { createTRPCRouter } from "@/server/api/trpc";
import { personsRouter } from "./routers/person/persons";
import { companiesRouter } from "./routers/companies/companies";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  persons: personsRouter,
  companies: companiesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
