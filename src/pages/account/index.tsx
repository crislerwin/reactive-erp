import { type NextPage } from "next";
import { SideMenu } from "@/components/SideMenu";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import AccountPage from "./[userId]";
import { type DefaultPageProps } from "@/common/schemas";
import { createTRPCContext } from "@/server/api/trpc";

const Profile: NextPage<DefaultPageProps> = ({ role }) => {
  return (
    <SideMenu role={role}>
      <AccountPage />
    </SideMenu>
  );
};

export default Profile;

export async function getServerSideProps(ctx: CreateNextContextOptions) {
  const { session } = await createTRPCContext(ctx);
  const { staffMember, user } = session;
  if (!user) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  if (!staffMember) {
    return {
      redirect: {
        destination: "/unauthorized",
        permanent: false,
      },
    };
  }

  return {
    props: {
      email: staffMember.email,
      role: staffMember.role,
      id: staffMember.id,
    },
  };
}
