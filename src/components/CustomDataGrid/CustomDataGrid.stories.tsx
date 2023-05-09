import type { Meta, StoryObj } from "@storybook/react";
import { CustomDataGrid } from "./CustomDataGrid";

const meta: Meta<typeof CustomDataGrid> = {
  title: "Example/CustomDataGrid",
  component: CustomDataGrid,
  tags: ["autodocs"],
  argTypes: {
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
    columns: [
      { key: "id", name: "ID" },
      { key: "title", name: "Title" },
    ],
    rows: [
      { id: 0, title: "Example" },
      { id: 1, title: "Demo" },
    ],
  },
};
