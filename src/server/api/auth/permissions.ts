import { type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { ZodError, z } from "zod";

export enum PermissionTypes {
  BACKOFFICE = "backoffice",
  PROVIDER_MANAGEMENT = "providers.management",
  INSTITUTION_MANAGEMENT = "institutions.management",
}

const permissionMap = {
  [PermissionTypes.BACKOFFICE]: z.object({
    name: z.nativeEnum(PermissionTypes),
    value: z.boolean(),
  }),
  [PermissionTypes.PROVIDER_MANAGEMENT]: z.object({
    name: z.nativeEnum(PermissionTypes),
    value: z.boolean(),
  }),
  [PermissionTypes.INSTITUTION_MANAGEMENT]: z.object({
    name: z.nativeEnum(PermissionTypes),
    value: z.boolean(),
  }),
};

export type UserPermissions<T extends PermissionTypes = PermissionTypes> =
  z.infer<(typeof permissionMap)[T]>;

export function findAndValidatePermission<T extends PermissionTypes>(
  permission: T,
  allPermissions: Prisma.JsonValue
): UserPermissions<T> | undefined {
  const parsedPermissions = JSON.parse(
    allPermissions?.toString() ?? JSON.stringify([])
  ) as unknown as UserPermissions<T>[];

  const selectedPermission = parsedPermissions.find(
    (p) => p.name === permission
  );

  const parsedPermission =
    permissionMap[permission].safeParse(selectedPermission);

  if (!parsedPermission.success) return undefined;

  return parsedPermission.data;
}
