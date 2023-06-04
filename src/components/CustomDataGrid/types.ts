import { type CalculatedColumn, type DataGridProps } from "react-data-grid";
import { type IconName } from "../Icons";

export type CustomRowContextType = {
  onRowFocusCapture?: (
    column: CalculatedColumn<unknown, unknown> | undefined
  ) => void;
};

interface ContextMenuOption {
  label: string;
  iconName: IconName;
  onClick: () => void;
}

export type CustomDataGridProps = DataGridProps<unknown, unknown, React.Key> &
  CustomRowContextType & {
    contextMenuOptions?: ContextMenuOption[];
  };
