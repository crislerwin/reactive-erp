import "react-data-grid/lib/styles.css";
import DataGrid, { type Column, type DataGridProps } from "react-data-grid";
import React from "react";
import { type Maybe } from "@trpc/server";

export type CustomDataGridProps = DataGridProps<unknown, unknown, React.Key>;
export type DataGridColumnType = Column<string, Maybe<string | number>>;

export const CustomDataGrid: React.FC<CustomDataGridProps> = (props) => {
  return <DataGrid {...props} />;
};
