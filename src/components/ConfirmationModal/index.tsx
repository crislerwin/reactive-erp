import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React from "react";

type ConfirmationModalProps = {
  title: string;
  actionButton: {
    name: string;
    className: string;
  };
  handleClose: () => void;
  handleConfirm: () => void;
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  handleClose,
  handleConfirm,
  actionButton,
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  return (
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
          onClick={handleClose}
          size="sm"
          className="bg-gray-500 text-white hover:bg-gray-600"
        >
          Cancelar
        </Button>
      </div>
    </Modal>
  );
};
