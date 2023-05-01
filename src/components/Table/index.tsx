import React, { useEffect, useRef, useState } from "react";
import { MantineReactTable } from "mantine-react-table";
import type { MRT_SortingState, MRT_Virtualizer } from "mantine-react-table";
import type { MantineReactTableProps } from "mantine-react-table";
import { MRT_Localization_PT_BR } from "mantine-react-table/locales/pt-BR";

export const Table: React.FC<MantineReactTableProps> = (props) => {
  const rowVirtualizerInstanceRef =
    useRef<MRT_Virtualizer<HTMLDivElement, HTMLTableRowElement>>(null);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  useEffect(() => {
    rowVirtualizerInstanceRef.current?.scrollToIndex(0);
  }, [sorting]);

  return (
    <MantineReactTable
      onSortingChange={setSorting}
      mantinePaperProps={{
        sx: (theme) => ({
          backgroundColor: theme.colors.gray[0],
        }),
      }}
      mantineBottomToolbarProps={{
        sx: (theme) => ({
          backgroundColor: theme.colors.gray[0],
          color: theme.colors.gray[9],
        }),
      }}
      mantineSearchTextInputProps={{
        placeholder: "Pesquisar...",
        sx: () => ({
          minWidth: "18rem",
        }),
        variant: "filled",
      }}
      mantineTopToolbarProps={{
        sx: (theme) => ({
          backgroundColor: theme.colors.gray[0],
        }),
      }}
      mantineTableHeadCellProps={{
        sx: (theme) => ({
          backgroundColor: theme.colors.gray[0],
          color: "red",
        }),
      }}
      mantineTableBodyCellProps={{
        sx: (theme) => ({
          backgroundColor: theme.colors.gray[0],
        }),
      }}
      enableFullScreenToggle={false}
      rowVirtualizerInstanceRef={rowVirtualizerInstanceRef}
      rowVirtualizerProps={{ overscan: 5 }}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      localization={MRT_Localization_PT_BR}
      columnVirtualizerProps={{ overscan: 2 }}
      {...props}
    />
  );
};
