import React, { type FocusEvent } from "react";
import {
  Row,
  type CalculatedColumn,
  type RowRendererProps,
} from "react-data-grid";
import { tv } from "tailwind-variants";
import { type CustomRowContextType } from "../../types";

const row = tv({
  base: "bg-white text-gray-700 dark:text-white dark:bg-gray-800 border-b border-gray-400 dark:border-gray-300",
});

export const CustomRowContext = React.createContext<CustomRowContextType>({});

export const CustomRowRenderer = (
  key: React.Key,
  props: RowRendererProps<unknown, unknown>
) => {
  const { onRowFocusCapture } = React.useContext(CustomRowContext);
  const { selectedCellIdx, viewportColumns } = props;
  const onFocusCapture = (event: FocusEvent) => {
    if (selectedCellIdx === undefined) return;
    const selectedColumn: CalculatedColumn<unknown, unknown> | undefined =
      viewportColumns[selectedCellIdx];
    event.preventDefault();
    onRowFocusCapture?.(selectedColumn);
  };
  return (
    <Row
      key={key}
      className={row()}
      onFocusCapture={onFocusCapture}
      {...props}
    />
  );
};
