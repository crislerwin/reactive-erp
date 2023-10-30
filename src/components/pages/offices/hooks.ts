import { type createCompanySchema } from "@/server/api/router/office";
import { getEnterpriseByCnpj } from "@/services/brasilapi.service";
import { trpc } from "@/utils/api";
import { useForm } from "@mantine/form";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useState } from "react";
import { z } from "zod";

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export const useCompanyForm = (close: () => void) => {
  const [cnpj, setCnpj] = useState<string | undefined>();
  const { mutate: handleUpdate } = trpc.office.update.useMutation();
  const context = trpc.useContext();
  const router = useRouter();
  const { companyId } = router.query;
  const { mutate: handleSave } = trpc.office.save.useMutation();
  const { mutate: handleDelete } = trpc.office.delete.useMutation();

  const {
    onSubmit,
    getInputProps,
    reset,
    values: formValues,
  } = useForm<CreateCompanyInput>({
    initialValues: {
      registrationId: "",
      socialReason: "",
      fantasyName: "",
      email: "",
      phoneNumber: "",
    },
    validate: {
      registrationId: (value) => {
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

  const handleSubmit = onSubmit((values) => {
    if (companyId) {
      handleUpdate(
        { id: String(companyId), ...values },
        {
          onSuccess: async () => {
            await context.office.findAll
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
        context.office.findAll.invalidate().catch((err) => console.log(err));
        reset();
        close();
      },
    });
  });

  const handleSearch = () => setCnpj(formValues.registrationId);

  const handleDeleteCompany = () =>
    handleDelete(
      { id: String(companyId) },
      {
        onSuccess: () => {
          context.office.findAll.invalidate().catch((err) => console.log(err));
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
