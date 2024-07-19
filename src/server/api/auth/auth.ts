import { ServerError } from "@/common/errors";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";

export type LoggedUser = {
  email: string;
  user_id: string;
  first_name: string;
  last_name?: string;
};

export const getServerAuthSession = async (
  ctx: CreateNextContextOptions
): Promise<LoggedUser> => {
  const { userId } = getAuth(ctx.req);
  if (!userId) throw new TRPCError(ServerError.NOT_ALLOWED);
  const { emailAddresses, firstName, lastName } =
    await clerkClient.users.getUser(userId);
  const [firstEmailAddress] = emailAddresses;
  if (!firstEmailAddress)
    throw new TRPCError(ServerError.EMAIL_ADDRESS_NOT_FOUND);

  return {
    email: firstEmailAddress.emailAddress,
    user_id: userId,
    first_name: firstName || "",
    last_name: lastName || "",
  };
};
