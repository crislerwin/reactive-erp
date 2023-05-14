import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import CommandPallete, { filterItems, getItemIndex } from ".";
import CommandPalette from ".";

const meta: Meta<typeof CommandPallete> = {
  title: "Components/CommandPallete",
  component: CommandPallete,
  tags: ["autodocs"],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof CommandPallete>;

const filteredItems = filterItems(
  [
    {
      heading: "Home",
      id: "home",
      items: [
        {
          id: "home",
          children: "Home",
          icon: "IconHome",
          href: "/",
        },
      ],
    },
    {
      heading: "Empresas",
      id: "companies",
      items: [
        {
          id: "companies",
          children: "Empresas",
          icon: "IconBuilding",
          href: "/companies",
        },
      ],
    },
  ],
  ""
);

export const Primary: Story = {
  args: {
    isOpen: true,
    selected: getItemIndex(filteredItems, "companies"),
    children: filteredItems.map((list) => (
      <CommandPalette.List key={list.id} heading={list.heading}>
        {list.items.map(({ id, ...rest }) => (
          <CommandPalette.ListItem
            key={id}
            index={getItemIndex(filteredItems, id)}
            {...rest}
          />
        ))}
      </CommandPalette.List>
    )),
  },
};
