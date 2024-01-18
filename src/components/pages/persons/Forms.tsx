import { Button, Group, Skeleton, TextInput } from "@mantine/core";
import { IconAt, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { ConfirmActionModal } from "@/components/ConfirmActionModal";
import { trpc } from "@/utils/api";
import { useRouter } from "next/router";
import { useForm } from "@mantine/form";
import { type z } from "zod";
import { type updateProviderSchema } from "@/server/api/schemas";

export const PersonForm: React.FC<{ close: () => void }> = ({ close }) => {
  const [deleteModalOpened, { close: closeDelete, open: openDelete }] =
    useDisclosure(false);
  const { mutate: savePerson } = trpc.provider.upsert.useMutation();
  const { mutate: updatePerson } = trpc.provider.upsert.useMutation();
  const { mutate: deletePerson } = trpc.provider.softDelete.useMutation();

  const {
    query: { providerId },
  } = useRouter();
  const context = trpc.useContext();
  const {
    data: provider,
    isFetching,
    isLoading,
  } = trpc.provider.findById.useQuery(
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
  } = useForm<z.infer<typeof updateProviderSchema>>({
    initialValues: {
      email: provider?.email ?? "",
      first_name: provider?.first_name ?? "",
      last_name: provider?.last_name ?? "",
    },
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
  const isLoadingProvider = isFetching || isLoading;

  return (
    <Group grow position="center" className="mb-2">
      {(isLoadingProvider || !provider) && isEdit ? (
        <Skeleton height={100} width={700} />
      ) : (
        <form onSubmit={handleSubmit}>
          <TextInput
            withAsterisk
            icon={<IconAt className="h-4 w-4 text-gray-600" />}
            label="Email"
            placeholder="Email"
            {...(getInputProps("email"), { defaultValue: provider?.email })}
          />
          <TextInput
            label="Nome"
            withAsterisk
            {...(getInputProps("first_name"),
            { defaultValue: provider?.first_name })}
            placeholder="Nome"
          />
          <TextInput
            label="Sobrenome"
            withAsterisk
            {...(getInputProps("last_name"),
            { defaultValue: provider?.last_name })}
            placeholder="Nome"
          />

          <div className="flex justify-end">
            <div className="mt-4 flex items-center justify-between">
              <ConfirmActionModal
                actionButton={{
                  name: "Excluir",
                  className: "bg-red-500 text-white hover:bg-red-600",
                  icon: <IconTrash className="h-4 w-4" />,
                }}
                close={closeDelete}
                title={`Deseja mesmo excluir a pessoa ${
                  formValues.first_name ?? ""
                } `}
                handleConfirm={handleDeletePerson}
                opened={deleteModalOpened}
              />
              <Button
                leftIcon={<IconPlus className="h-4 w-4" />}
                type="submit"
                className="mr-2 bg-slate-200 text-gray-600 hover:bg-slate-100 dark:bg-gray-700 dark:text-gray-200"
              >
                Salvar
              </Button>
              {isEdit && (
                <Button
                  onClick={openDelete}
                  size="sm"
                  leftIcon={<IconTrash className="h-4 w-4" />}
                  className="mr-2 bg-red-500 text-white hover:bg-red-600"
                >
                  Excluir
                </Button>
              )}
              <Button
                leftIcon={<IconX className="h-4 w-4" />}
                onClick={close}
                size="sm"
                className="bg-gray-500 text-white hover:bg-gray-600"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </form>
      )}
    </Group>
  );
};
