import { SideBar } from "@/components/SideBar";
import { CompanyForm } from "@/components/pages/companies/Forms";
import { CompanyTable } from "@/components/pages/companies/Table";
import { getAuth } from "@clerk/nextjs/server";
import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconUserPlus } from "@tabler/icons-react";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";

const Companies = () => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <SideBar>
      <div className="flex flex-col">
        <div className="mt-4 flex justify-end">
          <Modal
            opened={opened}
            transitionProps={{
              transition: "fade",
              duration: 600,
              timingFunction: "linear",
            }}
            onClose={close}
            centered
            classNames={{
              header: "dark:bg-gray-800 dark:text-gray-200 bg-slate-200",
              title: "dark:text-gray-200 text-gray-600 font-bold",
              content: "dark:bg-gray-800 dark:text-gray-200 bg-slate-200",
            }}
            title="Adicionar Empresa"
          >
            <CompanyForm close={close} />
          </Modal>
          <Button
            onClick={open}
            rightIcon={<IconUserPlus className="h-4 w-4" />}
            className="add-button bg-slate-200 text-gray-600 hover:bg-slate-100 dark:bg-gray-700 dark:text-gray-200 "
          >
            Adicionar Empresa
          </Button>
        </div>
        <div className="mt-4 rounded-sm">
          <CompanyTable />
        </div>
      </div>
    </SideBar>
  );
};
export default Companies;

export const getServerSideProps = (ctx: CreateNextContextOptions) => {
  const { userId } = getAuth(ctx.req);
  if (userId) {
    return {
      props: {},
    };
  }
  return {
    redirect: {
      destination: "/sign-in",
      permanent: false,
    },
  };
};
