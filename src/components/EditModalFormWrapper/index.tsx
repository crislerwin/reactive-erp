import { Modal, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPencil } from "@tabler/icons-react";
import { useRouter } from "next/router";

type EditModalProps = {
  pathName: string;
  label: string;
  children: (close: () => void) => React.ReactNode;
};

export const EditModalFormWrapper: React.FC<EditModalProps> = ({
  pathName,
  label,
  children,
}) => {
  const router = useRouter();
  const [editOpen, { open: openEdit, close: closeEdit }] = useDisclosure(
    false,
    {
      onClose: () => router.back(),
    }
  );

  return (
    <>
      <UnstyledButton
        className="flex w-12 cursor-pointer justify-center hover:text-orange-400 dark:hover:text-blue-500"
        onClick={() => {
          router
            .push(pathName)
            .then(() => openEdit())
            .catch((err) => console.log(err));
        }}
      >
        <IconPencil className="h-4 w-4" />
      </UnstyledButton>
      <Modal
        transitionProps={{
          transition: "fade",
          duration: 600,
          timingFunction: "linear",
        }}
        centered
        opened={editOpen}
        onClose={closeEdit}
        size="md"
        shadow="sm"
        title={label}
      >
        {children(closeEdit)}
      </Modal>
    </>
  );
};
