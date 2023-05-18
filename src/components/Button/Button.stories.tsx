import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: {
        type: "text",
      },
      description: "The content of the button.",
    },
    color: {
      control: {
        type: "select",
      },
      options: ["primary", "secondary", "danger"],
      description: "The color of the button.",
    },
    size: {
      control: {
        type: "select",
      },
      options: ["sm", "md", "lg"],
      description: "The size of the button.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: "Button",
    color: "primary",
    size: "md",
  },
};

export const Secondary: Story = {
  args: {
    children: "Button",
    color: "secondary",
    size: "md",
  },
};
