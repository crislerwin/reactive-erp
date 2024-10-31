import { clerkClient, getAuth } from "@clerk/nextjs/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";

export interface SimpleUser {
  user_id: string;
  email: string;
  full_name: string;
  image_url: string;
}
export const getServerAuthSession = async (
  ctx: CreateNextContextOptions
): Promise<SimpleUser | null> => {
  const { userId } = getAuth(ctx.req);
  if (!userId) return null;
  const clerkUser = await clerkClient.users.getUser(userId);
  return {
    user_id: clerkUser.id,
    image_url: clerkUser.imageUrl,
    email: clerkUser.primaryEmailAddress?.emailAddress || "",
    full_name: clerkUser?.fullName || "",
  };
};
