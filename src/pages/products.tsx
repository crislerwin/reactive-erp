import { useMemo, useState } from "react";
import {
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
} from "mantine-react-table";
import { type Product } from "@prisma/client";
import { modals } from "@mantine/modals";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@/utils/api";
import { SideMenu } from "@/components/SideMenu";
import CustomTable from "@/components/Table";
import { validateData } from "@/common/utils";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import {
  createProductSchema,
  updateProductSchema,
  type DefaultPageProps,
} from "@/common/schemas";
import { type z } from "zod";
import { updateQueryData } from "@/lib";
import { Skeleton } from "@mantine/core";
import { createTRPCContext } from "@/server/api/trpc";

type ProductsPageProps = DefaultPageProps;

export default function ProductsPage({ role }: ProductsPageProps) {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const { data: products = [], isLoading: isLoadingProducts } =
    trpc.product.findAll.useQuery();
  const { mutate: createProduct } = trpc.product.create.useMutation();
  const { mutate: updateProduct } = trpc.product.updateProduct.useMutation();
  const { mutate: deleteProduct, isLoading: isDeletingProduct } =
    trpc.product.deleteProduct.useMutation();
  const { data: productCategory } = trpc.productCategory.findAll.useQuery();

  const columns = useMemo<MRT_ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "product_id",
        header: "Id do Produto",
        enableEditing: false,
        size: 30,
      },
      {
        accessorKey: "name",
        header: "Nome do Produto",
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
        accessorKey: "price",
        header: "Preço",
        mantineEditTextInputProps: {
          type: "number",
          required: true,
          error: validationErrors?.price,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              price: undefined,
            }),
        },
      },
      {
        accessorKey: "stock",
        header: "Quantidade em estoque",
        mantineEditTextInputProps: {
          type: "number",
          error: validationErrors?.stock,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              stock: undefined,
            }),
        },
      },
      {
        accessorKey: "product_category_id",
        header: "Categoria",
        accessorFn: (row) => String(row.product_category_id ?? ""),
        editVariant: "select",
        Cell(props) {
          const category = productCategory?.find(
            (category) => category.id === props.row.original.product_category_id
          );
          return <div>{category?.name}</div>;
        },
        mantineEditSelectProps: {
          required: true,
          nothingFound: "Nenhuma categoria encontrada",
          limit: 5,
          data: productCategory?.map((category) => ({
            value: String(category.id),
            label: category.name,
          })),
          error: validationErrors?.product_category_id,
        },
      },
      {
        accessorKey: "available",
        header: "Disponível",
        accessorFn: (row) =>
          typeof row.available === "boolean" ? String(row.available) : "true",
        Cell(props) {
          return <div>{props.row.original.available ? "Sim" : "Não"}</div>;
        },
        editVariant: "select",
        mantineEditSelectProps: {
          data: [
            { label: "Sim", value: "true" },
            { label: "Não", value: "false" },
          ],
          error: validationErrors?.available,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              available: undefined,
            }),
        },
      },
      {
        accessorKey: "description",
        accessorFn: (row) => row.description ?? "",
        header: "Descrição",
        mantineEditTextInputProps: {
          type: "email",
          error: validationErrors?.description,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              description: undefined,
            }),
        },
      },
    ],
    [productCategory, validationErrors]
  );

  const handleCreateProduct: MRT_TableOptions<Product>["onCreatingRowSave"] = ({
    values,
    exitCreatingMode,
  }) => {
    const newValidationErrors = validateData<
      z.infer<typeof createProductSchema>
    >(values, createProductSchema);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    createProduct(values, {
      onSuccess: (data) => {
        updateQueryData<Product[]>(
          getQueryKey(trpc.product.findAll, undefined, "query"),
          (oldData) => {
            if (!oldData) return [];
            return [...oldData, data];
          }
        );
        setValidationErrors({});
        exitCreatingMode();
      },
    });
  };

  const handleSaveProduct: MRT_TableOptions<Product>["onEditingRowSave"] = ({
    values,
    exitEditingMode,
  }) => {
    const newValidationErrors = validateData(values, updateProductSchema);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    updateProduct(values, {
      onSuccess: (data) => {
        updateQueryData<Product[]>(
          getQueryKey(trpc.product.findAll, undefined, "query"),
          (oldData) => {
            if (!oldData) return [];
            return oldData.map((product) =>
              product.product_id === data.product_id ? data : product
            );
          }
        );
        setValidationErrors({});
        exitEditingMode();
      },
    });
  };

  const openDeleteConfirmModal = (row: MRT_Row<Product>) => {
    modals.openConfirmModal({
      title: "Deletar Filial",
      children: `Vocé tem certeza que quer excluir o produto ${row.original.name}?`,
      labels: { confirm: "Deletar", cancel: "Cancelar" },
      confirmProps: {
        variant: "filled",
        disabled: isDeletingProduct,
      },
      cancelProps: { variant: "outline" },
      onConfirm: () => {
        deleteProduct(
          { product_id: row.original.product_id },
          {
            onSuccess: () => {
              updateQueryData<Product[]>(
                getQueryKey(trpc.product.findAll, undefined, "query"),
                (oldData) => {
                  if (!oldData) return [];
                  return oldData.filter(
                    (data) => data.product_id !== row.original.product_id
                  );
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
      <Skeleton height="80vh" radius="xl" visible={isLoadingProducts}>
        {!isLoadingProducts && (
          <CustomTable
            addButtonLabel="Novo Produto"
            createModalLabel="Novo Produto"
            editModalLabel="Editar Produto"
            isLoading={isLoadingProducts}
            openDeleteConfirmModal={openDeleteConfirmModal}
            tableOptions={{
              onCreatingRowSave: handleCreateProduct,
              onEditingRowSave: handleSaveProduct,
              state: {
                columnVisibility: {
                  product_id: false,
                },
              },
            }}
            columns={columns}
            data={products}
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

  return {
    props: {
      email: staffMember.email,
      role: staffMember.role,
      id: staffMember.id,
    },
  };
}
