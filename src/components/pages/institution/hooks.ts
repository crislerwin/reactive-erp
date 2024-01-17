import { type createInstitutionSchema } from "@/server/api/schemas";
import { getEnterpriseByCnpj } from "@/services/brasilapi.service";
import { trpc } from "@/utils/api";
import { useForm } from "@mantine/form";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useState } from "react";
import { type z } from "zod";

export type CreateCompanyInput = z.infer<typeof createInstitutionSchema>;

export const useInstitutionForm = (close: () => void) => {
  const [cnpj, setCnpj] = useState<string | undefined>();
  const { mutate: handleUpdate } = trpc.institution.upsert.useMutation();
  const context = trpc.useContext();
  const router = useRouter();
  const { institutionId } = router.query;
  const parsedInstutionId = institutionId ? Number(institutionId) : undefined;
  const { mutate: handleSave } = trpc.institution.upsert.useMutation();
  const { mutate: handleDelete } = trpc.institution.delete.useMutation();
  const { data: institutionData } = trpc.institution.findById.useQuery(
    { id: parsedInstutionId },
    {
      enabled: !!institutionId,
    }
  );
  const {
    onSubmit,
    getInputProps,

    reset,
    values: formValues,
  } = useForm<CreateCompanyInput>({
    initialValues: {
      company_code: institutionData?.company_code ?? "",
      name: institutionData?.name ?? "",
      email: institutionData?.email ?? "",
      static_logo_url: institutionData?.static_logo_url ?? "",
    },

    validate: {},
  });

  useQuery(["brasil-api-company", cnpj], () => getEnterpriseByCnpj(cnpj), {
    enabled: !!cnpj,
    retry: false,
    onError: () => {
      reset();
      setCnpj(undefined);
    },
  });
  const handleSubmit = onSubmit((values) => {
    if (institutionId) {
      handleUpdate(
        { id: Number(institutionId), ...values },
        {
          onSuccess: () => {
            context.institution.findAll
              .invalidate()
              .catch((err) => console.log(err));
            close();
          },
        }
      );
      return;
    }

    handleSave(values, {
      onSuccess: async () => {
        await context.institution.findAll.invalidate();

        reset();
        close();
      },
    });
  });

  const handleSearch = () => setCnpj(formValues.company_code);

  const handleDeleteCompany = () =>
    handleDelete(
      { id: parsedInstutionId },
      {
        onSuccess: async () => {
          await context.institution.findAll.invalidate();
          close();
        },
      }
    );

  const isEdit = !!institutionId;
  return {
    handleSubmit,
    getInputProps,
    handleSearch,
    formValues,
    isEdit,
    handleDeleteCompany,
  };
};
