import React from "react";
import {
  useMantineReactTable,
  type MRT_TableOptions,
  type MRT_Row,
} from "mantine-react-table";
import { MantineReactTable, MRT_EditActionButtons } from "mantine-react-table";
import {
  Button,
  Tooltip,
  Stack,
  Title,
  Flex,
  ActionIcon,
  Skeleton,
} from "@mantine/core";
import { IconEdit, IconTrash, IconNews } from "@tabler/icons-react";
import { MRT_Localization_PT_BR } from "mantine-react-table/locales/pt-BR";

interface TableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: MRT_TableOptions<T>["columns"];
  editModalLabel?: string;
  createModalLabel?: string;
  addButtonLabel?: string;
  tableOptions?: Partial<MRT_TableOptions<T>>;
  isLoading?: boolean;
  error?: boolean;
  branch_id?: number;
  openDeleteConfirmModal: (row: MRT_Row<T>) => void;
  enableEditing?: boolean;
  className?: string;
}

export function Table<T extends Record<string, unknown>>({
  data,
  columns,
  tableOptions,
  isLoading = false,
  branch_id,
  error = false,
  enableEditing = true,
  editModalLabel = "Editar",
  createModalLabel = "Novo",
  addButtonLabel = "Novo",
  openDeleteConfirmModal,
  className = "dark:bg-gray-800 dark:text-white text-black bg-slate-10",
}: TableProps<T>) {
  const table = useMantineReactTable({
    columns,
    data,
    localization: MRT_Localization_PT_BR,
    createDisplayMode: "row",
    editDisplayMode: "row",

    enableFullScreenToggle: false,
    enableEditing,
    mantineTableProps: {
      variant: "hovered",
      withBorder: true,
    },
    mantineTableBodyCellProps: {
      className,
    },
    mantinePaperProps: {
      className,
    },
    mantineBottomToolbarProps: {
      className,
    },
    mantineTableHeadCellProps: {
      className,
    },
    mantineTopToolbarProps: {
      className,
    },
    mantinePaginationProps: {
      className,
    },

    getRowId: ({ id }) => String(id),
    mantineToolbarAlertBannerProps: error
      ? {
          color: "red",
          children: "Erro ao buscar dados",
        }
      : undefined,
    mantineTableContainerProps: {
      sx: {
        maxHeight: "72vh",
      },
    },
    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>{createModalLabel}</Title>
        {internalEditComponents}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </Flex>
      </Stack>
    ),
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>{editModalLabel}</Title>
        {internalEditComponents}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </Flex>
      </Stack>
    ),
    renderRowActions: ({ row, table }) => {
      const isOwner = row.original?.role && row.original.role === "OWNER";
      const isSameBranch =
        row.original?.branch_id && row.original.branch_id === branch_id;
      const isNotAllowedToDelete = isOwner || isSameBranch;
      return (
        <Flex gap="md">
          <Tooltip label="Salvar">
            <ActionIcon
              onClick={() => {
                table.setEditingRow(row);
              }}
            >
              <IconEdit />
            </ActionIcon>
          </Tooltip>
          {isNotAllowedToDelete ? null : (
            <Tooltip label="Excluir">
              <ActionIcon
                color="red"
                onClick={() => openDeleteConfirmModal(row)}
              >
                <IconTrash />
              </ActionIcon>
            </Tooltip>
          )}
        </Flex>
      );
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Tooltip withArrow label={addButtonLabel}>
        <Button
          variant="outline"
          onClick={() => {
            table.setCreatingRow(true);
          }}
          rightIcon={<IconNews />}
        >
          Novo
        </Button>
      </Tooltip>
    ),
    state: {
      isLoading,
      isSaving: isLoading,
      showAlertBanner: error,
      showProgressBars: isLoading,
      ...tableOptions?.state,
    },
    ...tableOptions,
  });

  return (
    <Skeleton height="80vh" radius="xl" visible={isLoading}>
      {!isLoading && <MantineReactTable table={table} />}
    </Skeleton>
  );
}
