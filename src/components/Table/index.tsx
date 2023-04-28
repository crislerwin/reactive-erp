import React, { useEffect, useRef, useState } from "react";
import { MantineReactTable } from "mantine-react-table";
import type { MRT_SortingState, MRT_Virtualizer } from "mantine-react-table";
import type { MantineReactTableProps } from "mantine-react-table";

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
      rowVirtualizerInstanceRef={rowVirtualizerInstanceRef}
      rowVirtualizerProps={{ overscan: 5 }}
      columnVirtualizerProps={{ overscan: 2 }}
      {...props}
    />
  );
};
