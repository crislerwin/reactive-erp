import { useQuery } from "@tanstack/react-query";
import { TextInput, Button, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAt, IconSearch } from "@tabler/icons-react";
import { getEnterpriseByCnpj } from "@/services/brasilapi.service";
import React, { useState } from "react";
import { type CreateCompanyInput } from "@/server/api/routers/companies/companies";
import { trpc } from "@/utils/api";

export const useCompanyForm = (close: () => void) => {
  const [cnpj, setCnpj] = useState<string | undefined>();
  const { mutate: handleSave } = trpc.company.save.useMutation();
  const context = trpc.useContext();
  const {
    onSubmit,
    getInputProps,
    setFieldValue,
    reset,
    values: formValues,
  } = useForm<CreateCompanyInput>({
    initialValues: {
      cnpj: "",
      socialReason: "",
      fantasyName: "",
      email: "",
    },
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
  const handleSubmit = onSubmit((values) =>
    handleSave(values, {
      onSuccess: () => {
        context.company.findAll
          .invalidate()
          .then(() => {
            reset();
            close();
          })
          .catch((err) => console.log(err));
      },
    })
  );
  const handleSearch = () => setCnpj(formValues.cnpj);
  return {
    handleSubmit,
    getInputProps,
    handleSearch,
  };
};

export const CompanyForm: React.FC<{ close: () => void }> = ({ close }) => {
  const { handleSubmit, getInputProps, handleSearch } = useCompanyForm(close);

  return (
    <Group grow position="center" className="mb-2">
      <form onSubmit={handleSubmit}>
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
          placeholder="CNPJ (Somente números)"
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
          <div className="mt-4 flex items-center justify-between">
            <Button
              type="submit"
              className="mr-2 bg-slate-200 text-gray-600 hover:bg-slate-100 dark:bg-gray-700 dark:text-gray-200"
            >
              Salvar
            </Button>
            <Button
              onClick={close}
              size="sm"
              className="bg-gray-500 text-white hover:bg-gray-600"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </Group>
  );
};
