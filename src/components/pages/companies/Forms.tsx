import { TextInput, Button, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAt, IconSearch } from "@tabler/icons-react";
import { getEnterpriseByCnpj } from "@/services/brasilapi.service";
import React, { useState } from "react";
import { trpc } from "@/utils/api";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import {
  createCompanyInputValidation,
  updateCompanyInputValidation,
} from "@/server/api/routers/companies";
import { z } from "zod";

export const useCompanyForm = (close: () => void) => {
  const [cnpj, setCnpj] = useState<string | undefined>();
  const { mutate: handleUpdate } = trpc.company.update.useMutation();
  const context = trpc.useContext();

  type CreateCompanyInput = z.infer<typeof createCompanyInputValidation>;

  const { mutate: handleSave } = trpc.company.save.useMutation();
  const router = useRouter();
  const { companyId } = router.query;

  trpc.company.findById.useQuery(
    { companyId: Number(companyId) },
    {
      enabled: !!companyId,
      onSuccess: (data) => {
        const fieldValues: (keyof CreateCompanyInput)[] = [
          "fantasyName",
          "socialReason",
          "cnpj",
          "email",
        ];
        const formatedData: CreateCompanyInput = {
          fantasyName: data.fantasyName,
          socialReason: data.socialReason,
          cnpj: data.cnpj,
          email: data.email,
        };
        fieldValues.forEach((field) => {
          setFieldValue(field, formatedData[field]);
        });
      },
    }
  );

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
    validate: {
      cnpj: (value) => {
        if (!value) return "Campo obrigatório";
        if (value.length !== 14) return "CNPJ inválido";
        return true;
      },
      socialReason: (value) => {
        if (!value) return "Campo obrigatório";
        return true;
      },
      fantasyName: (value) => {
        if (!value) return "Campo obrigatório";
        return true;
      },
      email: (value) => {
        if (!value) return "Campo obrigatório";
        const isValidMail = z.string().email().safeParse(value);
        if (!isValidMail.success) return "E-mail inválido";
        return true;
      },
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
  const handleSubmit = onSubmit((values) => {
    if (companyId) {
      handleUpdate(
        { companyId: Number(companyId), ...values },
        {
          onSuccess: () => {
            context.company.findAll
              .invalidate()
              .catch((err) => console.log(err));
            close();
          },
        }
      );
      return;
    }

    handleSave(values, {
      onSuccess: () => {
        context.company.findAll.invalidate().catch((err) => console.log(err));
        reset();
        close();
      },
    });
  });

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
