import { TextInput, Button, Group } from "@mantine/core";
import {
  IconAt,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import React from "react";
import { ActionModal } from "@/components/ActionModal";
import { useDisclosure } from "@mantine/hooks";
import { useInstitutionForm } from "./hooks";

export const CompanyForm: React.FC<{ close: () => void }> = ({ close }) => {
  const {
    handleSubmit,
    getInputProps,
    handleSearch,
    formValues,
    handleDeleteCompany,
    isEdit,
  } = useInstitutionForm(close);
  const [deleteModalOpened, { close: closeDelete, open: openDelete }] =
    useDisclosure(false);
  return (
    <Group grow position="center" className="mb-2">
      <form onSubmit={handleSubmit}>
        <TextInput
          label="CNPJ"
          withAsterisk
          {...getInputProps("company_code")}
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
          label="Nome da Instituição"
          placeholder="Nome da Instituição"
          {...getInputProps("fantasyName")}
        />
        <TextInput
          label="Logo da instituição"
          placeholder="Logo da instituição"
          {...getInputProps("static_logo_url")}
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
            <ActionModal
              actionButton={{
                name: "Excluir",
                className: "bg-red-500 text-white hover:bg-red-600",
                icon: <IconTrash className="h-4 w-4" />,
              }}
              title={`Deseja mesmo excluir a instituição ${formValues.name}?`}
              handleConfirm={handleDeleteCompany}
              opened={deleteModalOpened}
              close={closeDelete}
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
