import { type CalculatedColumn, type DataGridProps } from "react-data-grid";

export type CustomRowContextType = {
  onRowFocusCapture?: (
    column: CalculatedColumn<unknown, unknown> | undefined
  ) => void;
};

export type CustomDataGridProps = DataGridProps<unknown, unknown, React.Key> &
  CustomRowContextType;
