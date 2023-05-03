import { Button, Modal, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React from "react";

type ConfirmationModalProps = {
  title: string;
  children?: React.ReactNode;
  actionButton: {
    name: string;
    icon?: React.ReactNode;
    className: string;
  };
  handleConfirm: () => void;
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  handleConfirm,
  actionButton,
  children,
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <>
      <UnstyledButton
        className="flex w-12 cursor-pointer justify-center"
        onClick={open}
      >
        {children}
      </UnstyledButton>
      <Modal
        centered
        opened={opened}
        onClose={close}
        size="md"
        shadow="sm"
        title={title}
      >
        <div className="mt-4 flex justify-around">
          <Button
            onClick={handleConfirm}
            size="sm"
            className={actionButton.className}
          >
            {actionButton.name}
          </Button>
          <Button
            onClick={close}
            size="sm"
            className="bg-gray-500 text-white hover:bg-gray-600"
          >
            Cancelar
          </Button>
        </div>
      </Modal>
    </>
  );
};
