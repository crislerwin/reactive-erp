import "react-data-grid/lib/styles.css";
import DataGrid, {
  type DataGridProps,
  Row,
  type CalculatedColumn,
  type RowRendererProps,
} from "react-data-grid";
import React from "react";
import { type FocusEvent } from "react";

interface CustomRowContextType {
  onRowFocusCapture?: (
    column: CalculatedColumn<unknown, unknown> | undefined
  ) => void;
}

const CustomRowContext = React.createContext<CustomRowContextType>({});

const CustomRowRenderer = (
  _key: React.Key,
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
  return <Row onFocusCapture={onFocusCapture} {...props} />;
};

export type CustomDataGridProps = DataGridProps<unknown, unknown, React.Key> &
  CustomRowContextType;

export const CustomDataGrid: React.FC<CustomDataGridProps> = ({
  onRowFocusCapture,
  ...rest
}) => {
  return (
    <CustomRowContext.Provider value={{ onRowFocusCapture }}>
      <DataGrid
        renderers={{
          rowRenderer: CustomRowRenderer,
        }}
        {...rest}
      />
    </CustomRowContext.Provider>
  );
};
