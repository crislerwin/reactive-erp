import { prisma } from "@/server/db";
import { appRouter } from "../../root";
import { createCaller } from "../../trpc";
import { faker } from "@faker-js/faker";
import { type Branch, type Staff } from "@prisma/client";
import { type z } from "zod";
import {
  type createStaffMemberSchema,
  type createBranchSchema,
} from "@/common/schemas";
import { randomUUID } from "crypto";

export type UserRoles = "OWNER" | "ADMIN" | "EMPLOYEE" | "MANAGER";

export const makeStaffRequest = (
  branch_id: number,
  role: UserRoles = "OWNER"
): z.infer<typeof createStaffMemberSchema> => ({
  active: true,
  branch_id,
  role,
  email: faker.internet.email(),
  last_name: faker.name.lastName(),
  first_name: faker.name.firstName(),
});

export const makeBranchRequest = (): z.infer<typeof createBranchSchema> => ({
  name: faker.company.name(),
});

export const createStaffMember = async (
  branch_id: number,
  role: UserRoles = "OWNER"
): Promise<Staff> => {
  return prisma.staff.create({
    data: makeStaffRequest(branch_id, role),
  });
};

export const createBranch = async (): Promise<Branch> => {
  return prisma.branch.create({
    data: {
      name: faker.company.name(),
    },
  });
};

export const makeApp = async ({
  branch_id,
  staff,
}: {
  branch_id: number;
  staff?: Staff;
}) => {
  if (!staff) staff = await createStaffMember(branch_id);

  const app = createCaller(appRouter);
  return app({
    prisma,
    session: {
      user: {
        email: staff.email,
        full_name: staff.first_name,
        user_id: randomUUID(),
        image_url: faker.image.imageUrl(),
      },
      staffMember: staff,
    },
  });
};

export async function makeSut() {
  const branch = await createBranch();
  const app = await makeApp({ branch_id: branch.branch_id });
  const productCategory = await prisma.productCategory.create({
    data: {
      name: faker.commerce.department(),
      branch_id: branch.branch_id,
    },
  });
  return { app, branch, productCategory };
}
