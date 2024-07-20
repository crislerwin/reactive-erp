import { useMemo, useState } from "react";
import {
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
} from "mantine-react-table";
import { type ProductCategory } from "@prisma/client";
import { modals } from "@mantine/modals";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@/utils/api";
import { SideMenu } from "@/components/SideMenu";
import CustomTable from "@/components/Table";
import { validateData } from "@/common/utils";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type DefaultPageProps } from "@/common/schemas";
import {
  createProductCategorySchema,
  updateProductCategorySchema,
} from "@/common/schemas/product-category.schema";
import { updateQueryData } from "@/lib";
import { Skeleton } from "@mantine/core";
import { managerRoles } from "@/common/constants";
import { createTRPCContext } from "@/server/api/trpc";

type ProductCategoryPageProps = DefaultPageProps;

export default function ProductCategoryPage({
  role,
}: ProductCategoryPageProps) {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const { data: productCategories = [], isLoading: isLoadingProductCategory } =
    trpc.productCategory.findAll.useQuery();
  const { mutate: createProductCategory } =
    trpc.productCategory.createCategory.useMutation();
  const { mutate: updateProductCategory } =
    trpc.productCategory.updateCategory.useMutation();
  const {
    mutate: deleteProductCategory,
    isLoading: isDeletingProductCategory,
  } = trpc.productCategory.deleteCategory.useMutation();

  const columns = useMemo<MRT_ColumnDef<ProductCategory>[]>(
    () => [
      {
        accessorKey: "id",
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
      {
        accessorKey: "active",
        accessorFn: (row) =>
          String(Boolean(row.active)) === "true" ? "true" : "false",
        header: "Ativo",
        Cell({ row }) {
          return <>{String(row.original.active) === "true" ? "Sim" : "Não"}</>;
        },

        editVariant: "select",
        mantineEditSelectProps: {
          error: validationErrors?.active,

          data: [
            { label: "Sim", value: "true" },
            { label: "Não", value: "false" },
          ],
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              active: undefined,
            }),
        },
      },
    ],
    [validationErrors]
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
          updateQueryData<ProductCategory[]>(
            getQueryKey(trpc.productCategory.findAll, undefined, "query"),
            (oldData) => {
              if (!oldData) return [];
              return [...oldData, data];
            }
          );
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
          updateQueryData<ProductCategory[]>(
            getQueryKey(trpc.productCategory.findAll, undefined, "query"),
            (oldData) => {
              if (!oldData) return [];
              return oldData.map((productCategory) =>
                productCategory.id === data.id ? data : productCategory
              );
            }
          );
          setValidationErrors({});
          exitEditingMode();
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
        disabled: isDeletingProductCategory,
      },
      cancelProps: { variant: "outline" },
      onConfirm: () => {
        deleteProductCategory(
          { id: row.original.id },
          {
            onSuccess: () => {
              updateQueryData<ProductCategory[]>(
                getQueryKey(trpc.productCategory.findAll, undefined, "query"),
                (oldData) => {
                  if (!oldData) return [];
                  return oldData.filter(
                    (productCategory) => productCategory.id !== row.original.id
                  );
                }
              );
            },
          }
        );
      },
    });
  };
  console.log(validationErrors);
  return (
    <SideMenu role={role}>
      <Skeleton height="80vh" radius="xl" visible={isLoadingProductCategory}>
        {!isLoadingProductCategory && (
          <CustomTable
            addButtonLabel="Nova Categoria"
            createModalLabel="Nova Categoria"
            editModalLabel="Editar Categoria"
            isLoading={isLoadingProductCategory}
            openDeleteConfirmModal={openDeleteConfirmModal}
            tableOptions={{
              onCreatingRowSave: handleCreateProduct,
              onEditingRowSave: handleSaveProduct,
              state: {
                columnVisibility: {
                  id: false,
                },
              },
            }}
            columns={columns}
            data={productCategories}
          />
        )}
      </Skeleton>
    </SideMenu>
  );
}

export async function getServerSideProps(ctx: CreateNextContextOptions) {
  const { session } = await createTRPCContext(ctx);
  const { staffMember, user } = session;
  if (!user) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  if (!staffMember) {
    return {
      redirect: {
        destination: "/unauthorized",
        permanent: false,
      },
    };
  }
  if (!managerRoles.includes(staffMember.role)) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      email: staffMember.email,
      role: staffMember.role,
      id: staffMember.id,
    },
  };
}
