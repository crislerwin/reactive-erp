import { Button, Group, TextInput } from "@mantine/core";
import { IconAt, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import { usePersonForm } from "./hooks";
import { useDisclosure } from "@mantine/hooks";
import { ConfirmActionModal } from "@/components/ConfirmActionModal";

export const PersonForm: React.FC<{ close: () => void }> = ({ close }) => {
  const {
    handleSubmit,
    isEdit,
    getInputProps,
    formValues,
    handleDeletePerson,
  } = usePersonForm(close);
  const [deleteModalOpened, { close: closeDelete, open: openDelete }] =
    useDisclosure(false);
  return (
    <Group grow position="center" className="mb-2">
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Nome"
          withAsterisk
          {...getInputProps("firstName")}
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
            <ConfirmActionModal
              actionButton={{
                name: "Excluir",
                className: "bg-red-500 text-white hover:bg-red-600",
                icon: <IconTrash className="h-4 w-4" />,
              }}
              close={closeDelete}
              title={`Deseja mesmo excluir a pessoa ${formValues.firstName}?`}
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
    </Group>
  );
};
