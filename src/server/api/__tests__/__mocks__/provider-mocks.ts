import { faker } from "@faker-js/faker";

export const makeFakeProviderParams = () => ({
  email: faker.internet.email(),
  name: faker.name.fullName(),
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  middle_name: faker.name.middleName(),
  bio: {
    date_of_birth: faker.date.birthdate().toISOString(),
    phone_number: faker.phone.number(),
  },
});
