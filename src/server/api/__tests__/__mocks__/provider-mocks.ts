import { faker } from "@faker-js/faker";
import { type updateProviderSchema } from "../../schemas";
import { type z } from "zod";

export const makeFakeProviderParams = (): z.infer<
  typeof updateProviderSchema
> => ({
  email: faker.internet.email(),
  full_name: faker.name.fullName(),
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  bio: {
    date_of_birth: faker.date.birthdate().toISOString(),
    phone_number: faker.phone.number(),
  },
});
