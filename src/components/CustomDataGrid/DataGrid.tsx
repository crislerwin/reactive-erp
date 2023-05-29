import "react-data-grid/lib/styles.css";
import DataGrid from "react-data-grid";
import React from "react";

import { type CustomDataGridProps } from "./types";
import {
  CustomRowContext,
  CustomRowRenderer,
} from "./Renderers/CustomRowRenderer";
import { tableClass } from "./styles";
import { Box, Button } from "@mantine/core";

type MenuProps = {
  anchorEl: HTMLElement | null;
  columnName: string;
  onClose: () => void;
};

const ContextMenu: React.FC<MenuProps> = ({
  anchorEl,
  onClose,
  columnName,
}) => {
  if (!anchorEl) return null;
  return (
    <Box
      className="absolute z-10
       h-40 w-40 rounded-sm bg-slate-100 dark:bg-[#0F172A]"
      top={anchorEl?.offsetTop}
      left={anchorEl?.offsetLeft}
    >
      <h1>{columnName}</h1>
    </Box>
  );
};
const initialState = {
  currentTarget: null,
  columnName: "",
};
export const CustomDataGrid: React.FC<CustomDataGridProps> = ({
  onRowFocusCapture,
  ...rest
}) => {
  const [contextMenuState, setContextMenuState] = React.useState<{
    currentTarget: HTMLElement | null;
    columnName: string;
  }>(initialState);
  const onCellContextMenu: CustomDataGridProps["onCellContextMenu"] = (
    { column },
    evt
  ) => {
    evt.preventDefault();
    evt.stopPropagation();
    setContextMenuState({
      currentTarget: evt.currentTarget,
      columnName: column.name.toString(),
    });
  };
  return (
    <CustomRowContext.Provider value={{ onRowFocusCapture }}>
      <ContextMenu
        columnName={contextMenuState.columnName}
        anchorEl={contextMenuState.currentTarget}
        onClose={() => setContextMenuState(initialState)}
      />
      <DataGrid
        enableVirtualization
        onCellContextMenu={onCellContextMenu}
        onCellClick={() => setContextMenuState(initialState)}
        className={tableClass()}
        renderers={{
          rowRenderer: CustomRowRenderer,
        }}
        {...rest}
      />
    </CustomRowContext.Provider>
  );
};
