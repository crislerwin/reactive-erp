import { Button, Modal } from "@mantine/core";
import React from "react";

type Props = {
  title: string;
  close: () => void;
  handleConfirm: () => void;
  opened: boolean;
  actionButton: {
    name: string;
    icon?: React.ReactNode;
    className: string;
  };
};

export const ActionModal: React.FC<Props> = ({
  title,
  handleConfirm,
  actionButton,
  close,
  opened,
}) => {
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
          onClick={close}
          size="sm"
          className="bg-gray-500 text-white hover:bg-gray-600"
        >
          Cancelar
        </Button>
      </div>
    </Modal>
  );
};
