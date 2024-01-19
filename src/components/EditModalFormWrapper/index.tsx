import { Modal, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPencil } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";

type EditModalProps = {
  redirectTo: string;
  label: string;
  children: (close: () => void) => React.ReactNode;
};

export const EditModalFormWrapper: React.FC<EditModalProps> = ({
  redirectTo,
  label,
  children,
}) => {
  const router = useRouter();
  const [isOpen, { open, close }] = useDisclosure(false, {
    onClose: () => router.back(),
  });

  return (
    <>
      <Link
        href={redirectTo}
        onClick={open}
        className="flex w-12 cursor-pointer justify-center hover:text-orange-400 dark:hover:text-blue-500"
      >
        <IconPencil className="h-4 w-4" />
      </Link>
      <Modal
        transitionProps={{
          transition: "fade",
          duration: 600,
          timingFunction: "linear",
        }}
        centered
        opened={isOpen}
        onClose={close}
        size="md"
        shadow="sm"
        title={label}
      >
        {children(close)}
      </Modal>
    </>
  );
};
