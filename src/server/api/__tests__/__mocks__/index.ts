import { prisma } from "@/server/db";
import { appRouter } from "../../root";
import { createCaller } from "../../trpc";
import { faker } from "@faker-js/faker";
import { ProductCategory, type Branch, type Staff } from "@prisma/client";
import { type z } from "zod";
import {
  type createStaffMemberSchema,
  type createBranchSchema,
} from "@/common/schemas";
import { randomUUID } from "crypto";

export const makeStaffRequest = (
  branch_id: number
): z.infer<typeof createStaffMemberSchema> => ({
  active: true,
  branch_id,
  role: "ADMIN",
  email: faker.internet.email(),
  last_name: faker.name.lastName(),
  first_name: faker.name.firstName(),
});

export const makeBranchRequest = (): z.infer<typeof createBranchSchema> => ({
  name: faker.company.name(),
});

export const createStaffMember = async (branch_id: number): Promise<Staff> => {
  return prisma.staff.create({
    data: makeStaffRequest(branch_id),
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
  const currentStaff = await createStaffMember(branch_id);
  if (!staff) {
    staff = currentStaff;
  }
  const app = createCaller(appRouter);
  return app({
    prisma,
    session: {
      user: {
        email: staff.email,
        first_name: staff.first_name,
        last_name: staff.last_name || "",
        user_id: randomUUID(),
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
