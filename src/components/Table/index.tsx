import React from "react";
import {
  useMantineReactTable,
  type MRT_TableOptions,
  type MRT_Row,
} from "mantine-react-table";
import { MantineReactTable, MRT_EditActionButtons } from "mantine-react-table";
import { Button, Tooltip, Stack, Title, Flex, ActionIcon } from "@mantine/core";
import { IconEdit, IconTrash, IconNews } from "@tabler/icons-react";
import { MRT_Localization_PT_BR } from "mantine-react-table/locales/pt-BR";
import { parseToStringArray } from "./utils";

interface CustomTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: MRT_TableOptions<T>["columns"];
  tableOptions?: Partial<MRT_TableOptions<T>>;
  isLoading?: boolean;
  error?: boolean;
  branch_id?: number;
  openDeleteConfirmModal: (row: MRT_Row<T>) => void;
  enableEditing?: boolean;
}

export default function CustomTable<T extends Record<string, unknown>>({
  data,
  columns,
  tableOptions,
  isLoading = false,
  branch_id,
  error = false,
  enableEditing = true,
  openDeleteConfirmModal,
}: CustomTableProps<T>) {
  const table = useMantineReactTable({
    ...tableOptions,
    columns,
    data,
    localization: MRT_Localization_PT_BR,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableEditing,
    getRowId: ({ id }) => String(id),
    mantineToolbarAlertBannerProps: error
      ? {
          color: "red",
          children: "Erro ao buscar dados",
        }
      : undefined,
    mantineTableContainerProps: {
      sx: {
        minHeight: "500px",
      },
    },

    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Novo</Title>
        {internalEditComponents}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </Flex>
      </Stack>
    ),
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Editar</Title>
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
          <Tooltip label="Editar">
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
      <Tooltip withArrow label="Novo item">
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
    },
  });

  return <MantineReactTable table={table} />;
}
