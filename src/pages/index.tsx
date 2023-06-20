import { getAuth } from "@clerk/nextjs/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { SideBar } from "@/components/SideBar";
import { useUser } from "@clerk/nextjs";
import {
  CustomDataGrid,
  headerCellClass,
  type CustomDataGridProps,
} from "@/components/CustomDataGrid";
import { faker } from "@faker-js/faker";

const Table = () => {
  const rows: CustomDataGridProps["rows"] = Array.from(
    { length: 1000 },
    () => ({
      id: faker.datatype.uuid(),
      title: faker.name.prefix(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    })
  );
  const columns: CustomDataGridProps["columns"] = [
    {
      key: "id",
      name: "ID",
      headerCellClass: headerCellClass(),
    },
    {
      key: "title",
      name: "Title",
      headerCellClass: headerCellClass(),
    },
    {
      key: "firstName",
      name: "First Name",
      headerCellClass: headerCellClass(),
    },
    {
      key: "lastName",
      name: "Last Name",
      headerCellClass: headerCellClass(),
    },
  ];
  return <CustomDataGrid columns={columns} rows={rows} />;
};

const Home = () => {
  const { user } = useUser();
  if (!user) return <></>;

  return (
    <SideBar iconName="IconHome" label="Home">
      <Table />
    </SideBar>
  );
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
