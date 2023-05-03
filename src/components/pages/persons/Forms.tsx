import { createPersonInputValidation } from "@/server/api/routers/person";
import { trpc } from "@/utils/api";
import { Button, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAt } from "@tabler/icons-react";
import { z } from "zod";

type CreatePersonInput = z.infer<typeof createPersonInputValidation>;

const usePersonForm = (close: () => void) => {
  const { mutate } = trpc.person.save.useMutation();
  const context = trpc.useContext();
  const {
    onSubmit,
    getInputProps,
    setFieldValue,
    reset,
    values: formValues,
  } = useForm<CreatePersonInput>({
    initialValues: {
      email: "",
      userName: "",
    },
  });
  const handleSubmit = onSubmit((values) =>
    mutate(values, {
      onSuccess: () => {
        context.person.findAll.invalidate();
        reset();
        close();
      },
    })
  );
  return {
    getInputProps,
    handleSubmit,
  };
};

export const PersonForm: React.FC<{ close: () => void }> = ({ close }) => {
  const { handleSubmit, getInputProps } = usePersonForm(close);
  return (
    <Group grow position="center" className="mb-2">
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Nome"
          withAsterisk
          {...getInputProps("userName")}
          placeholder="Nome"
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
