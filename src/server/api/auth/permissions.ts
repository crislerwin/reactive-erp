import { type Prisma } from "@prisma/client";
import { z } from "zod";

export enum PermissionTypes {
  backoffice = "backoffice",
  providers_management = "providers.management",
  institutions_management = "institutions.management",
}

const sanitizeValue = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const boolDict: Record<string, boolean> = {
  true: true,
  false: false,
  yes: true,
  no: false,
  1: true,
  0: false,
};

const parseBoolean = (value: string): boolean | undefined => {
  const sanitizedValue = sanitizeValue(value);
  return boolDict[sanitizedValue];
};

const customBoolSchema = z
  .string()
  .refine((value) => boolDict[sanitizeValue(value)] !== undefined)
  .transform((value) => parseBoolean(sanitizeValue(value)) !== undefined);

const permissionMap = {
  [PermissionTypes.backoffice]: z.object({
    name: z.nativeEnum(PermissionTypes),
    value: customBoolSchema,
  }),
  [PermissionTypes.providers_management]: z.object({
    name: z.nativeEnum(PermissionTypes),
    value: customBoolSchema,
  }),
  [PermissionTypes.institutions_management]: z.object({
    name: z.nativeEnum(PermissionTypes),
    value: customBoolSchema,
  }),
};

export type UserPermissions<T extends PermissionTypes = PermissionTypes> =
  z.infer<(typeof permissionMap)[T]>;

export function findUserPermission<T extends PermissionTypes>(
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
  return parsedPermission.success ? parsedPermission.data : selectedPermission;
}
