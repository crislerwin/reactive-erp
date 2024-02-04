import { faker } from "@faker-js/faker";
import { type updateProviderValidation } from "../../validations";
import { type z } from "zod";

export const makeFakeProviderParams = (): z.infer<
  typeof updateProviderValidation
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
