/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { Meta, StoryObj } from "@storybook/react";
import { CustomDataGrid } from "./DataGrid";
import {
  type ReactGridProps,
  type Column,
  type Row,
  type CellChange,
  type TextCell,
} from "@silevis/reactgrid";
import React from "react";
import { Grid } from "@mantine/core";
const meta: Meta<typeof CustomDataGrid> = {
  title: "Components/CustomDataGrid",
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

interface Person {
  name: string;
  surname: string;
}

const getPeople = (): Person[] => [
  { name: "Thomas", surname: "Goldman" },
  { name: "Susie", surname: "Quattro" },
  { name: "", surname: "" },
];

const getColumns = (): Column[] => [
  { columnId: "name", resizable: true },
  { columnId: "surname", resizable: true },
];

const headerRow: Row = {
  rowId: "header",
  cells: [
    { type: "header", text: "Name" },
    { type: "header", text: "Surname" },
  ],
};

const getRows = (people: Person[]): Row[] => [
  headerRow,
  ...people.map<Row>((person, idx) => ({
    rowId: idx,
    cells: [
      { type: "text", text: person.name },
      { type: "text", text: person.surname },
    ],
  })),
];

const applyChangesToPeople = (
  changes: CellChange<TextCell>[],
  prevPeople: Person[]
): Person[] => {
  const peopleWithChanges = [...prevPeople];
  for (const change of changes) {
    const rowId = change.rowId;
    const columnId = change.columnId;
    // @ts-ignore
    peopleWithChanges[rowId][columnId] = change.newCell.text;
  }
  return peopleWithChanges;
};
const TestComponent: React.FC<ReactGridProps> = () => {
  const [people, setPeople] = React.useState<Person[]>(getPeople());
  const rows = getRows(people);
  const columns = getColumns();
  const handleChanges = (changes: CellChange<TextCell>[]) => {
    setPeople((prevPeople) => applyChangesToPeople(changes, prevPeople));
  };
  return (
    <CustomDataGrid
      rows={rows}
      enableRangeSelection
      enableFillHandle
      columns={columns}
      enableRowSelection
      onCellsChanged={handleChanges as ReactGridProps["onCellsChanged"]}
    />
  );
};

const rows = getRows(getPeople());
const columns = getColumns();

export const Primary: Story = {
  args: {
    columns,
    rows,
  },

  render: (props) => <TestComponent {...props} />,
};
