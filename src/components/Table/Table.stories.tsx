import type { Meta, StoryObj } from "@storybook/react";
import CustomTable from ".";
import { faker } from "@faker-js/faker";
import { ModalsProvider } from "@mantine/modals";
import React from "react";

const meta: Meta<typeof CustomTable> = {
  title: "Components/Table",
  component: CustomTable,
  tags: ["autodocs"],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof CustomTable>;

export const Primary: Story = {
  decorators: [
    (Story) => (
      <ModalsProvider>
        <Story />
      </ModalsProvider>
    ),
  ],
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
      id: faker.datatype.uuid(),
      cnpj: faker.datatype.number(),
      email: faker.internet.email(),
      fantasyName: faker.company.name(),
      socialReason: faker.company.companySuffix(),
    })),
  },
};
