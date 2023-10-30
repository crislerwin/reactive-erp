import { createTRPCRouter } from "@/server/api/trpc";
import { patientRouter } from "./router/patient";
import { officeRouter } from "./router/office";

export const appRouter = createTRPCRouter({
  patient: patientRouter,
  office: officeRouter,
});

export type AppRouter = typeof appRouter;
