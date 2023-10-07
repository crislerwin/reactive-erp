import "react-data-grid/lib/styles.css";
import React from "react";
import { ReactGrid, type ReactGridProps } from "@silevis/reactgrid";
import "./styles.scss";

export const CustomDataGrid: React.FC<ReactGridProps> = (props) => {
  return <ReactGrid {...props} />;
};
