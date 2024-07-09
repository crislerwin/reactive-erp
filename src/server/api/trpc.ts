import { prisma } from "@/server/db";
import { TRPCError, initTRPC } from "@trpc/server";
import { type OpenApiMeta } from "trpc-openapi";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";
import { type Staff, type PrismaClient } from "@prisma/client";
import { getServerAuthSession } from "./auth";
import { type AppRouter } from "./root";

type CreateContextOptions = {
  prisma?: PrismaClient;
  session: {
    account: Staff;
  };
};

export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma: opts.prisma || prisma,
  };
};

export const createTRPCContext = async (ctx: CreateNextContextOptions) => {
  const account = await getServerAuthSession(ctx);

  return createInnerTRPCContext({
    session: { account },
  });
};

const t = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createTRPCContext>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      };
    },
  });

export const createCaller = (router: AppRouter) =>
  t.createCallerFactory(router);

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.account) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, account: ctx.session.account },
    },
  });
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
