import React from "react";
import { type MRT_Localization, MantineReactTable } from "mantine-react-table";
import type { MRT_TableOptions } from "mantine-react-table";
import { MRT_Localization_PT_BR } from "mantine-react-table/locales/pt-BR";

export function MantineTable(props: MRT_TableOptions) {
  return (
    <MantineReactTable
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
      localization={MRT_Localization_PT_BR as Partial<MRT_Localization>}
      columnVirtualizerProps={{ overscan: 2 }}
      {...props}
    />
  );
}
