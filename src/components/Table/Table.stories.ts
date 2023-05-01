import type { Meta, StoryObj } from "@storybook/react";
import { Table } from ".";

const meta: Meta<typeof Table> = {
  title: "Example/Table",
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
    data: [
      {
        cnpj: "123456789",
        email: "test@email.com",
        fantasyName: "Test",
        socialReason: "Test",
      },
    ],
  },
};
