import { type createCompanyInputValidation } from "@/pages/api/trpc/server/main/routes/company/company-validation";
import { getEnterpriseByCnpj } from "@/services/brasilapi.service";
import { trpc } from "@/utils/api";
import { useForm } from "@mantine/form";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useState } from "react";
import { z } from "zod";

export type CreateCompanyInput = z.infer<typeof createCompanyInputValidation>;
export const useCompanyForm = (close: () => void) => {
  const [cnpj, setCnpj] = useState<string | undefined>();
  const { mutate: handleUpdate } = trpc.company.update.useMutation();
  const context = trpc.useContext();
  const router = useRouter();
  const { companyId } = router.query;
  const { mutate: handleSave } = trpc.company.save.useMutation();
  const { mutate: handleDelete } = trpc.company.delete.useMutation();

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
        const validCnpj = z.string().min(14).max(14).safeParse(value);
        if (!validCnpj.success) return "CNPJ inválido";
        return null;
      },
      socialReason: (value) => {
        const validSocialReason = z.string().min(3).safeParse(value);
        if (!validSocialReason.success) return "Campo obrigatório";
        return null;
      },
      fantasyName: (value) => {
        const validFantasyName = z.string().min(3).safeParse(value);
        if (!validFantasyName.success) return "Campo obrigatório";
        return null;
      },
      email: (value) => {
        const validEmail = z.string().email().safeParse(value);
        if (!validEmail.success) return "Email inválido";
        return null;
      },
    },
  });

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

  const handleDeleteCompany = () =>
    handleDelete(
      { companyId: Number(companyId) },
      {
        onSuccess: () => {
          context.company.findAll.invalidate().catch((err) => console.log(err));
          close();
        },
      }
    );

  const isEdit = !!companyId;
  return {
    handleSubmit,
    getInputProps,
    handleSearch,
    formValues,
    isEdit,
    handleDeleteCompany,
  };
};
