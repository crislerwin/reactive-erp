import { type providerSchema } from "@/server/api/schemas";
import { trpc } from "@/utils/api";
import { useForm } from "@mantine/form";
import { useRouter } from "next/router";
import { type z } from "zod";

type CreatePersonInput = z.infer<typeof providerSchema>;

export const usePersonForm = (close: () => void) => {
  const { mutate: savePerson } = trpc.provider.upsert.useMutation();
  const { mutate: updatePerson } = trpc.provider.upsert.useMutation();
  const { mutate: deletePerson } = trpc.provider.softDelete.useMutation();
  const {
    query: { providerId },
  } = useRouter();
  const { data: provider } = trpc.provider.findById.useQuery(
    { id: Number(providerId) },
    {
      enabled: !!providerId,
    }
  );

  const {
    onSubmit,
    getInputProps,
    reset,
    values: formValues,
  } = useForm<CreatePersonInput>({
    initialValues: {
      email: provider?.email ?? "",
      name: provider?.name ?? "",
      first_name: provider?.first_name ?? "",
      last_name: provider?.last_name ?? "",
      middle_name: provider?.middle_name ?? "",
    },

    validate: {},
  });

  const context = trpc.useContext();

  const isEdit = !!providerId;
  const handleSubmit = onSubmit((values) => {
    if (isEdit) {
      updatePerson(
        { ...values, id: Number(providerId) },
        {
          onSuccess: async () => {
            await context.provider.findAll.invalidate();

            reset();
            close();
          },
        }
      );
      return;
    }
    savePerson(values, {
      onSuccess: () => {
        context.provider.findAll.invalidate().catch((err) => console.log(err));
        reset();
        close();
      },
    });
  });

  const handleDeletePerson = () => {
    deletePerson(
      { id: Number(providerId) },
      {
        onSuccess: () => {
          context.provider.findAll
            .invalidate()
            .catch((err) => console.log(err));
          close();
        },
      }
    );
  };

  return {
    getInputProps,
    handleSubmit,
    isEdit,
    provider,
    formValues,
    handleDeletePerson,
  };
};
