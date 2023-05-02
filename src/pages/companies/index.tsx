import { SideBar } from "@/components/SideBar";
import { type NextPage } from "next";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { TextInput, Button, Group, Modal, UnstyledButton } from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconAt,
  IconSearch,
  IconTrash,
  IconUserPlus,
} from "@tabler/icons-react";
import { getEnterpriseByCnpj } from "@/services/brasilapi.service";
import { useMemo, useState } from "react";
import { type CreateCompanyInput } from "@/server/api/routers/companies/companies";
import { trpc } from "@/utils/api";
import { useDisclosure } from "@mantine/hooks";
import { Table } from "@/components/Table";

const initialValues = {
  cnpj: "",
  socialReason: "",
  fantasyName: "",
  email: "",
};

const Companies: NextPage = () => {
  const [cnpj, setCnpj] = useState<string | undefined>();
  const [opened, { open, close }] = useDisclosure(false);
  const { mutate: handleSave, isLoading: isSaving } =
    trpc.company.save.useMutation();
  const { data, isFetching } = trpc.company.findAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const context = trpc.useContext();
  const {
    onSubmit,
    getInputProps,
    setFieldValue,
    reset,
    values: formValues,
  } = useForm<CreateCompanyInput>({
    initialValues,
  });

  useQuery(["brasil-api-company", cnpj], () => getEnterpriseByCnpj(cnpj), {
    enabled: !!cnpj,
    retry: false,
    onError: () => {
      reset();
      setCnpj(undefined);
    },
    onSuccess: (data) => {
      const fieldValues: (keyof Omit<CreateCompanyInput, "cnpj" | "email">)[] =
        ["fantasyName", "socialReason"];
      const formatedData: Omit<CreateCompanyInput, "cnpj" | "email"> = {
        fantasyName: data.nome_fantasia,
        socialReason: data.razao_social,
      };
      fieldValues.forEach((field) => {
        setFieldValue(field, formatedData[field]);
      });
    },
  });

  const handleSearch = () => setCnpj(formValues.cnpj);

  const columns = useMemo(
    () => [
      {
        accessorKey: "cnpj",
        header: "CNPJ",
        size: 150,
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 150,
      },
      {
        accessorKey: "fantasyName",
        header: "Nome Fantasia",
        size: 150,
      },
      {
        accessorKey: "socialReason",
        header: "Razão Social",
        size: 150,
      },
      {
        accessorKey: "id",
        header: "Excluir",
        size: 150,
        Cell: (props: { cell: { row: { id: string } } }) => {
          const { cell } = props;
          return (
            <UnstyledButton
              className="cursor-pointer hover:text-red-500"
              onClick={() => {
                console.log(cell.row.id);
              }}
            >
              <IconTrash className="h-4 w-4" />
            </UnstyledButton>
          );
        },
      },
    ],
    []
  );

  const tableData = useMemo(() => {
    if (!data) return [];
    return data;
  }, [data]);

  return (
    <SideBar>
      <div className="flex flex-col">
        <div className="mt-4 flex justify-end">
          <Modal
            opened={opened}
            transitionProps={{
              transition: "fade",
              duration: 600,
              timingFunction: "linear",
            }}
            onClose={close}
            centered
            classNames={{
              header: "dark:bg-gray-800 dark:text-gray-200 bg-slate-200",
              title: "dark:text-gray-200 text-gray-600 font-bold",
              content: "dark:bg-gray-800 dark:text-gray-200 bg-slate-200",
            }}
            title="Adicionar Empresa"
          >
            <Group grow position="center" className="mb-2">
              <form
                onSubmit={onSubmit((values) =>
                  handleSave(values, {
                    onSuccess: () => {
                      context.company.findAll
                        .invalidate()
                        .then(() => {
                          close();
                          reset();
                        })
                        .catch((err) => console.log(err));
                    },
                  })
                )}
              >
                <TextInput
                  label="CNPJ"
                  withAsterisk
                  {...getInputProps("cnpj")}
                  rightSection={
                    <IconSearch
                      onClick={handleSearch}
                      className="h-4 w-4 cursor-pointer dark:hover:text-gray-500"
                    />
                  }
                  placeholder="00.000.000/0000-00"
                />

                <TextInput
                  withAsterisk
                  label="Nome Fantasia"
                  placeholder="Nome Fantasia"
                  {...getInputProps("fantasyName")}
                />
                <TextInput
                  label="Razão Social"
                  placeholder="Razão Social"
                  {...getInputProps("socialReason")}
                />
                <TextInput
                  withAsterisk
                  icon={<IconAt className="h-4 w-4 text-gray-600" />}
                  label="Email"
                  placeholder="Email"
                  {...getInputProps("email")}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="mt-2 bg-slate-200 text-gray-600 hover:bg-slate-100 dark:bg-gray-700 dark:text-gray-200 "
                  >
                    Salvar
                  </Button>
                </div>
              </form>
            </Group>
          </Modal>
          <Button
            onClick={open}
            rightIcon={<IconUserPlus className="h-4 w-4" />}
            className="add-button bg-slate-200 text-gray-600 hover:bg-slate-100 dark:bg-gray-700 dark:text-gray-200 "
          >
            Adicionar Empresa
          </Button>
        </div>
        <div className="mt-4 h-full w-full rounded-sm">
          <Table
            isLoading={isFetching || isSaving}
            columns={columns}
            data={tableData}
          />
        </div>
      </div>
    </SideBar>
  );
};

export default Companies;
