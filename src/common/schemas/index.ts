export * from "./staff.schema";
export * from "./branch.schema";

export type DefaultPageProps = {
  email: string;
  role: string;
  id: number;
};

export const managerRoles = ["OWNER", "ADMIN", "MANAGER"];
