import { createTRPCRouter } from "@/server/api/trpc";
import { personsRouter } from "./routers/person/persons";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  persons: personsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
