import {
  type CellChange,
  type ReactGridProps as DatagridProps,
  type Cell,
} from "@silevis/reactgrid";

declare module "@silevis/reactgrid" {
  export type ReactGridProps = DatagridProps & {
    onCellsChanged?: (cellChanges: CellChange<typeof Cell>[]) => void;
  };
}
