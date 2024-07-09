import { prisma } from "@/server/db";
import { appRouter } from "../../root";
import { createCaller } from "../../trpc";
import { faker } from "@faker-js/faker";
import { Branch, type Staff } from "@prisma/client";

export const makeFakeStaff = (branch_id: number): Staff => ({
  active: true,
  id: faker.datatype.number(),
  branch_id,
  role: "ADMIN",
  email: faker.internet.email(),
  last_name: faker.name.lastName(),
  first_name: faker.name.firstName(),
  created_at: faker.date.past(),
  deleted_at: null,
  updated_at: faker.date.recent(),
});

export const makeBranchRequest = () => ({
  name: faker.company.name(),
  company_code: faker.helpers.fake("###-###-###"),
  email: faker.internet.email(),
});

export const createBranch = async (): Promise<Branch> => {
  return prisma.branch.create({
    data: {
      name: faker.company.name(),
      company_code: faker.helpers.fake("###-###-###"),
      email: faker.internet.email(),
    },
  });
};

export const makeApp = ({
  branch_id,
  staff = makeFakeStaff(branch_id),
}: {
  branch_id: number;
  staff?: Staff;
}) => {
  const app = createCaller(appRouter);
  return app({
    prisma,
    session: {
      account: staff,
    },
  });
};

export async function makeSut() {
  const branch = await createBranch();
  const staff = makeFakeStaff(branch.branch_id);
  const app = makeApp({ branch_id: branch.branch_id, staff });
  return { app, branch, staff };
}
