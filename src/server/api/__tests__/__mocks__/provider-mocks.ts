import { faker } from "@faker-js/faker";
import { type updateProviderValidation } from "../../validators";
import { type z } from "zod";

export const makeFakeProviderParams = (): z.infer<
  typeof updateProviderValidation
> => ({
  email: faker.internet.email(),
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  bio: {
    date_of_birth: faker.date.birthdate().toISOString(),
    phone_number: faker.phone.number(),
  },
});
