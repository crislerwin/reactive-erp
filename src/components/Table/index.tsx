import React, { useEffect, useRef, useState } from "react";
import { MRT_Localization, MantineReactTable } from "mantine-react-table";
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
        className:
          "dark:bg-gray-800 dark:text-white text-gray-800 bg-slate-100",
      }}
      mantineBottomToolbarProps={{
        className:
          "dark:bg-gray-800 dark:text-white text-gray-800 bg-slate-100",
      }}
      mantineSearchTextInputProps={{
        placeholder: "Pesquisar...",
        sx: () => ({
          minWidth: "18rem",
        }),
        variant: "filled",
      }}
      mantineTableBodyRowProps={{
        className:
          "dark:bg-gray-800 dark:text-white text-gray-800 dark:hover:bg-slate-200",
      }}
      mantineTopToolbarProps={{
        className:
          "dark:bg-gray-800 dark:text-white text-gray-800 bg-slate-100",
      }}
      mantineTableHeadCellProps={{
        className:
          "dark:bg-gray-800 dark:text-white text-gray-800 bg-slate-100",
      }}
      mantineTableBodyCellProps={{
        className:
          "dark:bg-gray-800 dark:text-white text-gray-800 bg-slate-100",
      }}
      enableFullScreenToggle={false}
      rowVirtualizerInstanceRef={rowVirtualizerInstanceRef}
      rowVirtualizerProps={{ overscan: 5 }}
      localization={MRT_Localization_PT_BR as Partial<MRT_Localization>}
      columnVirtualizerProps={{ overscan: 2 }}
      {...props}
    />
  );
};
