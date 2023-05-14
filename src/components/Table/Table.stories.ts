import type { Meta, StoryObj } from "@storybook/react";
import { Table } from ".";
import { faker } from "@faker-js/faker";

const meta: Meta<typeof Table> = {
  title: "Components/Table",
  component: Table,
  tags: ["autodocs"],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof Table>;

export const Primary: Story = {
  args: {
    columns: [
      {
        accessorKey: "cnpj",
        header: "CNPJ",
        size: 150,
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 150,
      },
      {
        accessorKey: "fantasyName",
        header: "Nome Fantasia",
        size: 150,
      },
      {
        accessorKey: "socialReason",
        header: "Razão Social",
        size: 150,
      },
    ],
    data: Array.from({ length: 10 }, () => ({
      cnpj: faker.datatype.number(),
      email: faker.internet.email(),
      fantasyName: faker.company.name(),
      socialReason: faker.company.companySuffix(),
    })),
  },
};
