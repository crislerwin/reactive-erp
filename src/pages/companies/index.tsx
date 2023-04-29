import { SideBar } from "@/components/SideBar";
import { type NextPage } from "next";
import { useQuery } from "@tanstack/react-query";
import { TextInput, Button, Group, Loader } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconSearch } from "@tabler/icons-react";
import { getEnterpriseByCnpj } from "@/services/brasilapi.service";
import { useMemo, useState } from "react";
import { type CreateCompanyInput } from "@/server/api/routers/companies/companies";
import { api } from "@/utils/api";
import { Table } from "@/components/Table";

const initialValues = {
  cnpj: "",
  socialReason: "",
  fantasyName: "",
  email: "",
};
const Companies: NextPage = () => {
  const [cnpj, setCnpj] = useState<string | undefined>();
  const { mutate } = api.company.save.useMutation();
  const { data } = api.company.findAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { onSubmit, getInputProps, setFieldValue, reset, values } =
    useForm<CreateCompanyInput>({
      initialValues,
    });

  const { isFetching } = useQuery(
    ["brasil-api-company", cnpj],
    () => getEnterpriseByCnpj(cnpj),
    {
      enabled: !!cnpj,
      retry: false,
      onError: () => {
        reset();
        setCnpj(undefined);
      },
      onSuccess: (data) => {
        const fieldValues: (keyof Omit<
          CreateCompanyInput,
          "cnpj" | "email"
        >)[] = ["fantasyName", "socialReason"];
        const formatedData: Omit<CreateCompanyInput, "cnpj" | "email"> = {
          fantasyName: data.nome_fantasia,
          socialReason: data.razao_social,
        };
        fieldValues.forEach((field) => {
          setFieldValue(field, formatedData[field]);
        });
      },
    }
  );

  const handleSearch = () => setCnpj(values.cnpj);

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
    ],
    []
  );

  const tableData = useMemo(() => {
    if (!data) return [];
    return data;
  }, [data]);

  return (
    <SideBar>
      <div>
        <form onSubmit={onSubmit((vals) => mutate(vals))}>
          <TextInput
            label={<span className="dark:text-white">Cnpj</span>}
            rightSection={
              <div onClick={handleSearch} className="cursor-pointer">
                {isFetching ? (
                  <Loader size="xs" />
                ) : (
                  <IconSearch color="currentColor" className="h-4 w-4" />
                )}
              </div>
            }
            placeholder="Digite o CNPJ >da empresa"
            {...getInputProps("cnpj")}
          />
          <TextInput
            className="dark:bg-gray-800"
            label={<span className="dark:text-white">Nome fantasia</span>}
            placeholder=""
            {...getInputProps("fantasyName")}
          />
          <TextInput
            label="Nome Fantasia"
            placeholder=""
            {...getInputProps("socialReason")}
          />

          <TextInput
            label={<span className="dark:text-white">Email</span>}
            placeholder=""
            {...getInputProps("email")}
          />

          <Group position="right" mt="md">
            <Button
              className="dark:bg-slate-500 dark:hover:bg-red-300  "
              type="submit"
            >
              Salvar
            </Button>
          </Group>
        </form>
      </div>
      <Table columns={columns} data={tableData} />
    </SideBar>
  );
};

export default Companies;
