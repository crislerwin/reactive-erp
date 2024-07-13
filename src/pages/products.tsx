import { useMemo, useState } from "react";
import {
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
} from "mantine-react-table";
import { useQueryClient } from "@tanstack/react-query";
import { type Product } from "@prisma/client";

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
import { customErrorHandler } from "@/common/errors/common";

type ProductsPageProps = DefaultPageProps;

export default function Products({ role }: ProductsPageProps) {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const queryClient = useQueryClient();
  const { data: products = [], isLoading: isLoadingProducts } =
    trpc.product.findAll.useQuery(undefined, { refetchOnWindowFocus: false });
  console.log(products);
  const { mutate: createProduct } = trpc.product.create.useMutation();
  const { mutate: updateProduct } = trpc.product.updateProduct.useMutation();
  const { mutate: deleteProduct, isLoading: isDeletingProduct } =
    trpc.product.deleteProduct.useMutation();
  const columns = useMemo<MRT_ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "product_id",
        accessorFn: (row) => (row.product_id ? String(row.product_id) : ""),
        header: "Id do Produto",
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: "name",
        accessorFn: (row) => row.name ?? "",
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
        accessorFn: (row) => (row.price ? String(row.price) : ""),
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
        accessorFn: (row) => (row.stock !== undefined ? String(row.stock) : 0),
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
        accessorFn: (row) =>
          row.product_category_id ? String(row.product_category_id) : "",
        editVariant: "select",
        mantineEditSelectProps: {
          required: true,
          data: [
            { label: "Categoria 1", value: "1" },
            { label: "Categoria 2", value: "2" },
          ],
          error: validationErrors?.product_category_id,
        },
      },
      {
        accessorKey: "available",
        header: "Disponível",
        accessorFn: (row) => (row.available ? "Sim" : "Não"),
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
      {
        accessorKey: "currency",
        accessorFn: (row) => row.currency ?? "",
        header: "Moeda",
        editVariant: "select",
        mantineEditSelectProps: {
          required: true,
          error: validationErrors?.currency,
          data: [
            { label: "USD", value: "USD" },
            { label: "BRL", value: "BRL" },
          ],
        },
      },
    ],
    [validationErrors]
  );
  const updateProductData = (newData: Product, variables: Partial<Product>) =>
    queryClient.setQueryData<Product[] | undefined>(
      getQueryKey(trpc.product.findAll, undefined, "query"),
      (oldData) => {
        if (!oldData) return;
        if (variables.product_id) {
          return oldData.map((data) =>
            data.product_id === variables.product_id ? newData : data
          );
        }
        return [...oldData, newData];
      }
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
        updateProductData(data, values);
        exitCreatingMode();
        setValidationErrors({});
      },
      onError: (error) => {
        customErrorHandler({
          title: "Ops! Ocorreu um erro ao criar o produto",
          message: error.message,
        });
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
        updateProductData(data, values);
        exitEditingMode();
        setValidationErrors({});
      },
      onError: (error) => {
        customErrorHandler({
          title: "Ops! Ocorreu um erro ao atualizar o produto",
          message: error.message,
        });
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
        color: "red",
        disabled: isDeletingProduct,
      },
      cancelProps: { variant: "outline" },
      onConfirm: () => {
        deleteProduct(
          { product_id: row.original.product_id },
          {
            onSuccess: () => {
              queryClient.setQueryData<Product[] | undefined>(
                getQueryKey(trpc.product.findAll, undefined, "query"),
                (oldData) => {
                  if (!oldData) return;
                  return oldData.filter(
                    (data) => data.product_id !== row.original.product_id
                  );
                }
              );
            },
            onError: (error) =>
              customErrorHandler({
                title: "Ops! Ocorreu um erro ao deletar o produto",
                message: error.message,
              }),
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
        isLoading={isLoadingProducts}
        openDeleteConfirmModal={openDeleteConfirmModal}
        tableOptions={{
          onCreatingRowSave: handleCreateProduct,
          onEditingRowSave: handleSaveProduct,
        }}
        columns={columns}
        data={products}
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
