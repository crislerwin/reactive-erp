import { useQuery } from "@tanstack/react-query";
import { TextInput, Button, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAt, IconSearch } from "@tabler/icons-react";
import { getEnterpriseByCnpj } from "@/services/brasilapi.service";
import React, { useState } from "react";
import { type CreateCompanyInput } from "@/server/api/routers/companies/companies";
import { trpc } from "@/utils/api";

export const CompanyForm: React.FC<{ close: () => void }> = ({ close }) => {
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

  const handleSearch = () => setCnpj(formValues.cnpj);
  return (
    <Group grow position="center" className="mb-2">
      <form
        onSubmit={onSubmit((values) =>
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
          <Button
            type="submit"
            className="mt-2 bg-slate-200 text-gray-600 hover:bg-slate-100 dark:bg-gray-700 dark:text-gray-200 "
          >
            Salvar
          </Button>
        </div>
      </form>
    </Group>
  );
};
