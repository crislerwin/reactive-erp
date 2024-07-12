export * from "./staff.schema";
export * from "./branch.schema";

export type DefaultPageProps = {
  branch_id: number;
  id: number;
  first_name: string;
  last_name?: string;
  email: string;
  role: string;
};

export const managerRoles = ["OWNER", "ADMIN", "MANAGER"];
