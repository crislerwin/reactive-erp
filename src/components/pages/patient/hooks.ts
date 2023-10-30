import { type createPersonSchema } from "@/server/api/router/patient";
import { trpc } from "@/utils/api";
import { useForm } from "@mantine/form";
import { useRouter } from "next/router";
import React from "react";
import { z } from "zod";

type CreatePersonInput = z.infer<typeof createPersonSchema>;

export const usePersonForm = (close: () => void) => {
  const { mutate: savePerson } = trpc.patient.save.useMutation();
  const { mutate: updatePerson } = trpc.patient.update.useMutation();
  const { mutate: deletePerson } = trpc.patient.delete.useMutation();
  const router = useRouter();
  const { personId } = router.query;
  const {
    onSubmit,
    getInputProps,
    reset,
    setFieldValue,
    values: formValues,
  } = useForm<CreatePersonInput>({
    initialValues: {
      email: "",
      firstName: "",
    },
    validate: {
      email: (value) => {
        const validEmail = z.string().email().safeParse(value);
        if (!validEmail.success) return "Email inválido";
        return null;
      },

      firstName: (value) => {
        const validUserName = z.string().min(3).safeParse(value);
        if (!validUserName.success) return "Nome inválido";
        return null;
      },
    },
  });

  const { data: person, isFetching: isFetchingPerson } =
    trpc.patient.getById.useQuery(
      { id: String(personId || "") },
      {
        enabled: !!personId,
      }
    );

  const handleLoadFields = (): void => {
    if (!person || isFetchingPerson) return;
    const fieldValueKeys: (keyof CreatePersonInput)[] = ["email", "firstName"];
    for (const key of fieldValueKeys) {
      setFieldValue(key, person[key]);
    }
  };

  React.useEffect(handleLoadFields, [person, isFetchingPerson]);

  const context = trpc.useContext();

  const isEdit = !!personId;
  const handleSubmit = onSubmit((values) => {
    if (isEdit) {
      updatePerson(
        { ...values, id: String(personId) },
        {
          onSuccess: async () => {
            await context.patient.findAll.invalidate();
            reset();
            close();
          },
        }
      );
      return;
    }
    savePerson(values, {
      onSuccess: async () => {
        await context.patient.findAll.invalidate();
        reset();
        close();
      },
    });
  });

  const handleDeletePerson = () => {
    deletePerson(
      { id: String(personId) },
      {
        onSuccess: async () => {
          await context.patient.findAll.invalidate();
          close();
        },
      }
    );
  };

  return {
    getInputProps,
    handleSubmit,
    isEdit,
    formValues,
    handleDeletePerson,
  };
};
