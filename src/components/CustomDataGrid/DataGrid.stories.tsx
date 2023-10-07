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
import React, { useEffect } from "react";
import { faker } from "@faker-js/faker";
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

const headerRow: Row = {
  rowId: "header",

  cells: [
    { type: "text", text: "Name" },
    { type: "header", text: "Surname" },
  ],
};

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

const columns = [
  { columnId: "name", resizable: true },
  { columnId: "surname", resizable: true },
];

function makeTableData<T = unknown[]>(length: number): T {
  const dataMap = new Map<string, string>();
  for (const column of columns) {
    dataMap.set(column.columnId, "");
  }
  return Array.from({ length }, () => Object.fromEntries(dataMap)) as T;
}

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

const TestComponent: React.FC = () => {
  const [people, setPeople] = React.useState<Person[]>(makeTableData(2));

  useEffect(() => {
    const newData = [
      {
        name: faker.name.lastName(),
        surname: faker.name.lastName(),
      },
      ...makeTableData<Person[]>(2),
    ];
    setPeople(newData);
  }, []);

  const rows = getRows(people);
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

export const Primary: Story = {
  args: {},

  render: () => <TestComponent />,
};
