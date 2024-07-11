import React from "react";
import {
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_TableOptions,
  type MRT_Row,
} from "mantine-react-table";
import { MantineReactTable, MRT_EditActionButtons } from "mantine-react-table";
import { Button, Tooltip, Stack, Title, Flex, ActionIcon } from "@mantine/core";
import { IconEdit, IconTrash, IconNews } from "@tabler/icons-react";
import { MRT_Localization_PT_BR } from "mantine-react-table/locales/pt-BR";
import { modals } from "@mantine/modals";

interface CustomTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: MRT_ColumnDef<T>[];
  tableOptions: MRT_TableOptions<T>;
  onDelete: (id: string | number) => void;
  isLoading?: boolean;
  error?: boolean;
  enableEditing?: boolean;
}

export default function CustomTable<T extends { id: string | number }>({
  data,
  columns,
  onDelete,
  tableOptions,
  isLoading = false,
  error = false,
  enableEditing = true,
}: CustomTableProps<T>) {
  const openDeleteConfirmModal = (row: MRT_Row<T>) => {
    modals.openConfirmModal({
      title: "Deletar item",
      children: `Você tem certeza que quer deletar o item com ID ${row.original.id}?`,
      labels: { confirm: "Deletar", cancel: "Cancelar" },
      confirmProps: { variant: "filled", color: "red" },
      cancelProps: { variant: "outline" },
      onConfirm: () => onDelete(row.original.id),
    });
  };

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
        <Title order={3}>Criar item</Title>
        {internalEditComponents}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </Flex>
      </Stack>
    ),
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Editar item</Title>
        {internalEditComponents}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </Flex>
      </Stack>
    ),
    renderRowActions: ({ row, table }) => (
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
        <Tooltip label="Excluir">
          <ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
            <IconTrash />
          </ActionIcon>
        </Tooltip>
      </Flex>
    ),
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
