import { useMemo, useState } from "react";
import {
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
} from "mantine-react-table";
import { useQueryClient } from "@tanstack/react-query";
import { ProductCategory, type Product } from "@prisma/client";

import { modals } from "@mantine/modals";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@/utils/api";
import { SideMenu } from "@/components/SideMenu";
import CustomTable from "@/components/Table";
import { validateData } from "@/components/Table/utils";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import {
  createProductSchema,
  updateProductSchema,
  type DefaultPageProps,
} from "@/common/schemas";
import { getServerAuthSession } from "@/server/api/auth";
import { type z } from "zod";
import { customErrorHandler } from "@/common/errors/customErrors";

type ProductCategoryPageProps = DefaultPageProps;

export default function ProductCategoryPage({
  role,
}: ProductCategoryPageProps) {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const queryClient = useQueryClient();

  const { data: productCategories = [], isLoading: isLoadingProductCategory } =
    trpc.productCategory.findAll.useQuery();
  const columns = useMemo<MRT_ColumnDef<ProductCategory>[]>(
    () => [
      {
        accessorKey: "product_id",
        accessorFn: (row) => (row.id ? String(row.id) : ""),
        header: "Id",
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: "name",
        accessorFn: (row) => row.name ?? "",
        header: "Nome",
        mantineEditTextInputProps: {
          type: "email",
          required: true,
          error: validationErrors?.name,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              name: undefined,
            }),
        },
      },
      {
        accessorKey: "description",
        accessorFn: (row) => row.description ?? "",
        header: "Descrição",
        mantineEditTextInputProps: {
          type: "text",
          error: validationErrors?.description,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              description: undefined,
            }),
        },
      },
    ],
    [validationErrors]
  );
  const updateProductCategoryData = (
    newData: Product,
    variables: Partial<ProductCategory>
  ) =>
    queryClient.setQueryData<ProductCategory[] | undefined>(
      getQueryKey(trpc.productCategory.findAll, undefined, "query"),
      (oldData) => {
        if (!oldData) return;
        if (variables.id) {
          return oldData.map((data) =>
            data.id === variables.id ? newData : data
          );
        }
        return [...oldData, newData];
      }
    );

  const handleCreateProduct: MRT_TableOptions<ProductCategory>["onCreatingRowSave"] =
    ({ values, exitCreatingMode }) => {
      const newValidationErrors = validateData(
        values,
        createProductCategorySchema
      );
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      createProductCategory(values, {
        onSuccess: (data) => {
          updateProductCategoryData(data, values);
          exitCreatingMode();
          setValidationErrors({});
        },
      });
    };

  const handleSaveProduct: MRT_TableOptions<ProductCategory>["onEditingRowSave"] =
    ({ values, exitEditingMode }) => {
      const newValidationErrors = validateData(
        values,
        updateProductCategorySchema
      );
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      updateProductCategory(values, {
        onSuccess: (data) => {
          updateProductCategoryData(data, values);
          exitEditingMode();
          setValidationErrors({});
        },
      });
    };

  const openDeleteConfirmModal = (row: MRT_Row<ProductCategory>) => {
    modals.openConfirmModal({
      title: "Deletar Filial",
      children: `Vocé tem certeza que quer excluir o produto ${row.original.name}?`,
      labels: { confirm: "Deletar", cancel: "Cancelar" },
      confirmProps: {
        variant: "filled",
        color: "red",
        disabled: isDeletingProduct,
      },
      cancelProps: { variant: "outline" },
      onConfirm: () => {
        deleteProductCategory(
          { id: row.original.id },
          {
            onSuccess: () => {
              queryClient.setQueryData<ProductCategory[] | undefined>(
                getQueryKey(trpc.product.findAll, undefined, "query"),
                (oldData) => {
                  if (!oldData) return;
                  return oldData.filter((data) => data.id !== row.original.id);
                }
              );
            },
          }
        );
      },
    });
  };

  return (
    <SideMenu role={role}>
      <CustomTable
        addButtonLabel="Novo Produto"
        createModalLabel="Novo Produto"
        editModalLabel="Editar Produto"
        isLoading={isLoadingProductCategory}
        openDeleteConfirmModal={openDeleteConfirmModal}
        tableOptions={{
          onCreatingRowSave: handleCreateProduct,
          onEditingRowSave: handleSaveProduct,
        }}
        columns={columns}
        data={productCategories}
      />
    </SideMenu>
  );
}

export async function getServerSideProps(ctx: CreateNextContextOptions) {
  const staffMember = await getServerAuthSession(ctx);
  if (!staffMember) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  return {
    props: {
      email: staffMember.email,
      role: staffMember.role,
      id: staffMember.id,
      branch_id: staffMember.branch_id,
      first_name: staffMember.first_name,
      last_name: staffMember.last_name,
    },
  };
}
