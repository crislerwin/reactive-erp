import { prisma } from "@/server/db";
import { TRPCError, initTRPC } from "@trpc/server";
import { type OpenApiMeta } from "trpc-openapi";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";
import { type Staff, type PrismaClient } from "@prisma/client";
import { getServerAuthSession, type SimpleUser } from "./auth";
import { type AppRouter } from "./root";

export type CreateContextOptions = {
  prisma?: PrismaClient;
  session: {
    user: SimpleUser | null;
    staffMember: Staff | null;
  };
};

export const createInnerTRPCContext = (opts: CreateContextOptions) => ({
  session: opts.session,
  prisma: opts.prisma || prisma,
});

export const createTRPCContext = async (ctx: CreateNextContextOptions) => {
  const user = await getServerAuthSession(ctx);
  if (!user) {
    return createInnerTRPCContext({
      prisma,
      session: { user: null, staffMember: null },
    });
  }

  const staffMember = await prisma.staff.findUnique({
    where: {
      email: user.email,
    },
    include: {
      branch: true,
    },
  });

  return createInnerTRPCContext({
    prisma,
    session: { user, staffMember },
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
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
