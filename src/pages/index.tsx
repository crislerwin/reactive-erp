import { getAuth } from "@clerk/nextjs/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type PageType, SideBar, type TabType } from "@/components/SideBar";
import { useUser } from "@clerk/nextjs";
import { CustomDataGrid } from "@/components/CustomDataGrid";
import { faker } from "@faker-js/faker";
import { IconHome } from "@tabler/icons-react";

const pages: PageType[] = [
  {
    page: (
      <CustomDataGrid
        columns={[
          { key: "id", name: "ID", headerCellClass: "rdg-headerCell" },
          { key: "title", name: "Title", headerCellClass: "rdg-headerCell" },
          {
            key: "firstName",
            name: "First Name",
            headerCellClass: "rdg-headerCell",
          },
          {
            key: "lastName",
            name: "Last Name",
            headerCellClass: "rdg-headerCell",
          },
        ]}
        rows={Array.from({ length: 1000 }, () => ({
          id: faker.datatype.uuid(),
          title: faker.name.prefix(),
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
        }))}
      />
    ),
    value: "/",
  },
];

const tabs: TabType[] = [
  {
    href: "/",
    icon: <IconHome className="h-4 w-4" />,
    label: "Home",
  },
];

const Home = () => {
  const { user } = useUser();
  if (!user) return <></>;

  return <SideBar pages={pages} tabs={tabs} />;
};
export const getServerSideProps = (ctx: CreateNextContextOptions) => {
  const { userId } = getAuth(ctx.req);
  if (!userId) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
};

export default Home;
