import { SignedIn, UserProfile } from "@clerk/nextjs";
import { type NextPage } from "next";
import { SideBar } from "@/components/SideBar";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getAuth } from "@clerk/nextjs/server";

const Profile: NextPage = () => {
  return (
    <SideBar>
      <SignedIn>
        <UserProfile
          appearance={{
            elements: {
              card: "bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden w-full text-gray-900 dark:text-gray-100",
              headerTitle: "text-gray-900 dark:text-gray-100",
              headerSubtitle: "text-gray-900 dark:text-gray-100",
              headerCloseButton: "text-gray-900 dark:text-gray-100",
              header: "bg-white dark:bg-gray-800",
              accordionContent: "text-gray-900 dark:text-gray-100",
              accordionTriggerButton: "text-gray-900 dark:text-gray-100",
              activeDeviceIcon: "text-gray-900 dark:text-gray-100",
              activeDeviceIcon__desktop: "text-gray-900 dark:text-gray-100",
              activeDeviceIcon__mobile: "text-gray-900 dark:text-gray-100",
              alert: "text-gray-900 dark:text-gray-100",
              navbar: "bg-white dark:bg-gray-800",
              navbarButton: "text-gray-900 dark:text-gray-100",
              navbarButton__account: "text-gray-900 dark:text-gray-100",
              userPreview__userButton: "text-gray-900 dark:text-gray-100",
              userPreviewAvatarImage: "text-gray-900 dark:text-gray-100",
              profileSectionTitleText__profile:
                "text-gray-900 dark:text-gray-100",
              profileSectionTitleText__activeDevices:
                "text-gray-900 dark:text-gray-100",
              profileSectionTitleText__connectedAccounts:
                "text-gray-900 dark:text-gray-100",
            },
          }}
        />
      </SignedIn>
    </SideBar>
  );
};

export default Profile;

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
