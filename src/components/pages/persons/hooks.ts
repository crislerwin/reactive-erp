import { type createPersonInputValidation } from "@/server/api/routers/person";
import { trpc } from "@/utils/api";
import { useForm } from "@mantine/form";
import { useRouter } from "next/router";
import { z } from "zod";

type CreatePersonInput = z.infer<typeof createPersonInputValidation>;

export const usePersonForm = (close: () => void) => {
  const { mutate } = trpc.person.save.useMutation();
  const { mutate: deletePerson } = trpc.person.delete.useMutation();
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
      userName: "",
    },
    validate: {
      email: (value) => {
        const validEmail = z.string().email().safeParse(value);
        if (!validEmail.success) return "Email inválido";
        return null;
      },

      userName: (value) => {
        const validUserName = z.string().min(3).safeParse(value);
        if (!validUserName.success) return "Nome inválido";
        return null;
      },
    },
  });

  trpc.person.getById.useQuery(
    { personId: Number(personId) },
    {
      enabled: !!personId,
      onSuccess: (data) => {
        if (!data) return;
        const valuesToLoad: (keyof CreatePersonInput)[] = ["email", "userName"];
        valuesToLoad.forEach((field) => {
          const loadFormData: CreatePersonInput = {
            email: data.email,
            userName: data.userName,
          };
          setFieldValue(field, loadFormData[field]);
        });
      },
    }
  );
  const context = trpc.useContext();

  const handleSubmit = onSubmit((values) =>
    mutate(values, {
      onSuccess: () => {
        context.person.findAll.invalidate().catch((err) => console.log(err));
        reset();
        close();
      },
    })
  );

  const handleDeletePerson = () => {
    deletePerson(
      { personId: Number(personId) },
      {
        onSuccess: () => {
          context.person.findAll.invalidate().catch((err) => console.log(err));
          close();
        },
      }
    );
  };

  return {
    getInputProps,
    handleSubmit,
    formValues,
    handleDeletePerson,
  };
};
