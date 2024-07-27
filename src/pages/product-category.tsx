import {
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
} from "mantine-react-table";
import { type ProductCategory } from "@prisma/client";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@/utils/api";
import { SideMenu } from "@/components/SideMenu";
import { CrudTable } from "@/design-system/Table";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type DefaultPageProps } from "@/common/schemas";
import {
  createProductCategorySchema,
  updateProductCategorySchema,
} from "@/common/schemas/product-category.schema";
import { updateQueryData } from "@/lib";
import { managerRoles } from "@/common/constants";
import { createTRPCContext } from "@/server/api/trpc";

type ProductCategoryPageProps = DefaultPageProps;

export default function ProductCategoryPage({
  role,
}: ProductCategoryPageProps) {
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

  const columns: MRT_ColumnDef<ProductCategory>[] = [
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
      },
    },
    {
      accessorKey: "description",
      accessorFn: (row) => row.description ?? "",
      header: "Descrição",
      mantineEditTextInputProps: {
        type: "text",
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
        data: [
          { label: "Sim", value: "true" },
          { label: "Não", value: "false" },
        ],
      },
    },
  ];

  const handleCreateProduct: MRT_TableOptions<ProductCategory>["onCreatingRowSave"] =
    ({ values, exitCreatingMode }) => {
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
        },
      });
    };

  const handleSaveProduct: MRT_TableOptions<ProductCategory>["onEditingRowSave"] =
    ({ values, exitEditingMode }) => {
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

          exitEditingMode();
        },
      });
    };

  const handleDeleteProductCategory = (row: MRT_Row<ProductCategory>) => {
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
  };
  return (
    <SideMenu role={role}>
      <CrudTable
        addButtonLabel="Nova Categoria"
        createModalLabel="Nova Categoria"
        editModalLabel="Editar Categoria"
        isLoading={isLoadingProductCategory}
        onConfirmDelete={handleDeleteProductCategory}
        onCreatingRowSave={handleCreateProduct}
        onEditingRowSave={handleSaveProduct}
        deleteModalProps={(row) => ({
          loading: isDeletingProductCategory,
          title: "Deletar Filial",
          children: `Vocé tem certeza que quer excluir o produto ${row.original.name}?`,
          labels: { confirm: "Deletar", cancel: "Cancelar" },
        })}
        creationSchema={createProductCategorySchema}
        updateSchema={updateProductCategorySchema}
        columns={columns}
        data={productCategories}
      />
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
