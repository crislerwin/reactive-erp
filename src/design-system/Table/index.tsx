import React, { useMemo } from "react";
import {
  useMantineReactTable,
  type MRT_TableOptions,
  type MRT_Row,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { MantineReactTable } from "mantine-react-table";
import {
  Tooltip,
  Stack,
  Title,
  Flex,
  ActionIcon,
  Skeleton,
} from "@mantine/core";
import { IconEdit, IconTrash, IconNews } from "@tabler/icons-react";
import { MRT_Localization_PT_BR } from "mantine-react-table/locales/pt-BR";
import { Button } from "../Button";
import { type ZodSchema } from "zod";
import { validateData } from "@/common/utils";

const defaultClassNames = {
  mantineTableBodyCellProps:
    "dark:bg-gray-800 dark:text-white text-black bg-slate-10",
  mantinePaperProps: "dark:bg-gray-800 dark:text-white text-black bg-slate-10",
  mantineBottomToolbarProps:
    "dark:bg-gray-800 dark:text-white text-black bg-slate-10",
  mantineTableHeadCellProps:
    "dark:bg-gray-800 dark:text-white text-black bg-slate-10",
  mantineTopToolbarProps:
    "dark:bg-gray-800 dark:text-white text-black bg-slate-10",
  mantinePaginationProps:
    "dark:bg-gray-800 dark:text-white text-black bg-slate-10",
};

interface TableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: MRT_TableOptions<T>["columns"];
  editModalLabel?: string;
  createModalLabel?: string;
  addButtonLabel?: string;
  tableOptions?: Partial<MRT_TableOptions<T>>;
  isLoading?: boolean;
  error?: boolean;
  creationSchema?: ZodSchema;
  updateSchema?: ZodSchema;
  onCreatingRowSave?: MRT_TableOptions<T>["onCreatingRowSave"];
  onEditingRowSave?: MRT_TableOptions<T>["onEditingRowSave"];
  onCreatingRowCancel?: MRT_TableOptions<T>["onCreatingRowCancel"];
  onEditingRowCancel?: MRT_TableOptions<T>["onEditingRowCancel"];
  openDeleteConfirmModal: (row: MRT_Row<T>) => void;
  enableEditing?: boolean;
  hideActions?: (
    row: MRT_Row<T>,
    action: "delete" | "edit" | "both"
  ) => boolean;
  classNames?: Record<keyof typeof defaultClassNames, string>;
  enableGrouping?: boolean;
}

export type AcessorkeyType = string | number;

export function Table<T extends Record<string, unknown>>({
  data,
  columns,
  isLoading = false,
  error = false,
  enableEditing = true,
  editModalLabel = "Editar",
  createModalLabel = "Novo",
  addButtonLabel = "Novo",
  onCreatingRowSave,
  onEditingRowSave,
  onCreatingRowCancel,
  onEditingRowCancel,
  creationSchema,
  updateSchema,
  openDeleteConfirmModal,
  classNames = defaultClassNames,
  enableGrouping = true,
  hideActions,
}: TableProps<T>) {
  const [validationErrors, setValidationErrors] = React.useState<
    Record<AcessorkeyType, string | undefined>
  >({});

  const tableColumns = useMemo<MRT_ColumnDef<T>[]>(() => {
    return columns.map((column) => {
      const columnkey = column.accessorKey as AcessorkeyType;
      return {
        ...column,
        mantineEditSelectProps: {
          ...column.mantineEditSelectProps,
          error: validationErrors[columnkey],
          onFocus: () => {
            setValidationErrors({
              ...validationErrors,
              [columnkey]: undefined,
            });
          },
        },
        mantineEditTextInputProps: {
          ...column.mantineEditTextInputProps,
          error: validationErrors[columnkey],
          onFocus: () => {
            setValidationErrors({
              ...validationErrors,
              [columnkey]: undefined,
            });
          },
        },
      };
    });
  }, [columns, validationErrors]);

  const table = useMantineReactTable({
    columns: tableColumns,
    data,
    enableGrouping,
    localization: MRT_Localization_PT_BR,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableFullScreenToggle: false,
    enableEditing,
    mantineTableProps: {
      variant: "hovered",
      withBorder: true,
    },
    mantineTableBodyCellProps: {
      className: classNames.mantineTableBodyCellProps,
    },
    mantinePaperProps: {
      className: classNames.mantinePaperProps,
    },
    mantineBottomToolbarProps: {
      className: classNames.mantineBottomToolbarProps,
    },
    mantineTableHeadCellProps: {
      className: classNames.mantineTableHeadCellProps,
    },
    mantineTopToolbarProps: {
      className: classNames.mantineTopToolbarProps,
    },
    mantinePaginationProps: {
      className: classNames.mantinePaginationProps,
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
      <Stack p={2}>
        <Title order={4}>{createModalLabel}</Title>
        {internalEditComponents}
        <Flex justify="flex-end">
          <Flex className="w-44" justify="space-around">
            <Button
              color="danger"
              onClick={() => {
                setValidationErrors({});
                onCreatingRowCancel?.({ row, table });
                table.setCreatingRow(null);
              }}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (creationSchema) {
                  const newValidationErrors = validateData(
                    row._valuesCache,
                    creationSchema
                  );
                  if (
                    Object.values(newValidationErrors).some((error) => error)
                  ) {
                    setValidationErrors(newValidationErrors);
                    return;
                  }
                }
                onCreatingRowSave?.({
                  exitCreatingMode: () => table.setCreatingRow(null),
                  row,
                  table,
                  values: row._valuesCache,
                });
              }}
              variant="outline"
            >
              Salvar
            </Button>
          </Flex>
        </Flex>
      </Stack>
    ),
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>{editModalLabel}</Title>
        {internalEditComponents}

        <Flex justify="flex-end">
          <Flex className="w-44" justify="space-around">
            <Button
              color="danger"
              onClick={() => {
                setValidationErrors({});
                onEditingRowCancel?.({ row, table });
                table.setEditingRow(null);
              }}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (updateSchema) {
                  const newValidationErrors = validateData(
                    row._valuesCache,
                    updateSchema
                  );
                  if (
                    Object.values(newValidationErrors).some((error) => error)
                  ) {
                    setValidationErrors(newValidationErrors);
                    return;
                  }
                }
                await onEditingRowSave?.({
                  exitEditingMode: () => table.setEditingRow(null),
                  row,
                  table,
                  values: row?._valuesCache,
                });
              }}
              variant="outline"
            >
              Salvar
            </Button>
          </Flex>
        </Flex>
      </Stack>
    ),
    renderRowActions: ({ row, table }) => {
      if (hideActions && hideActions(row, "edit")) {
        return (
          <Flex gap="md">
            <Tooltip label="Excluir">
              <ActionIcon
                color="red"
                onClick={() => openDeleteConfirmModal(row)}
              >
                <IconTrash />
              </ActionIcon>
            </Tooltip>
          </Flex>
        );
      }
      if (hideActions && hideActions(row, "delete")) {
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
          </Flex>
        );
      }
      if (hideActions && hideActions(row, "both")) {
        return null;
      }

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

          <Tooltip label="Excluir">
            <ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
              <IconTrash />
            </ActionIcon>
          </Tooltip>
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
    },
  });

  return (
    <Skeleton height="80vh" radius="xl" visible={isLoading}>
      {!isLoading && <MantineReactTable table={table} />}
    </Skeleton>
  );
}
