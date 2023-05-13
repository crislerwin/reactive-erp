import type { Meta, StoryObj } from "@storybook/react";
import { CustomDataGrid } from "./CustomDataGrid";
import { faker } from "@faker-js/faker";

const meta: Meta<typeof CustomDataGrid> = {
  title: "Example/CustomDataGrid",
  component: CustomDataGrid,
  tags: ["autodocs"],
  argTypes: {
    enableVirtualization: {
      description: "Enable virtualization",
      control: {
        type: "boolean",
      },
    },
    columns: {
      description: "The columns to display",
      control: {
        type: "object",
      },
    },
    rows: {
      description: "The rows to display",
      control: {
        type: "object",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CustomDataGrid>;

export const Primary: Story = {
  args: {
    enableVirtualization: true,
    columns: [
      { key: "id", name: "ID" },
      { key: "title", name: "Title" },
      { key: "firstName", name: "First Name" },
      { key: "lastName", name: "Last Name" },
    ],
    rows: Array.from({ length: 1000 }, () => ({
      id: faker.datatype.uuid(),
      title: faker.name.prefix(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    })),
  },
};
