import { SignedIn, UserProfile } from "@clerk/nextjs";
import { type NextPage } from "next";
import { SideBar } from "@/components/SideBar";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getAuth } from "@clerk/nextjs/server";

const Profile: NextPage = () => {
  return (
    <SideBar>
      <div className="flex h-full w-full flex-col items-center justify-center overflow-auto dark:bg-[#1E293B]">
        <SignedIn>
          <UserProfile
            appearance={{
              elements: {
                card: "dark:bg-[#1E293B]  text-gray-900 dark:text-white",
                headerTitle: "text-gray-900 dark:text-white",
                headerSubtitle: "text-gray-900 dark:text-white",
                headerCloseButton: "text-gray-900 dark:text-white",
                header: "bg-white dark:bg-[#1E293B]",
                accordionContent: "text-gray-900 dark:text-white",
                accordionTriggerButton: "text-gray-900 dark:text-white",
                activeDeviceIcon: "text-gray-900 dark:text-white",
                activeDeviceIcon__desktop: "text-gray-900 dark:text-white",
                activeDeviceIcon__mobile: "text-gray-900 dark:text-white",
                alert: "text-gray-900 dark:text-white",
                navbar: "bg-white dark:bg-[#1E293B]",
                navbarButton: "text-gray-900 dark:white",
                navbarButton__account: "text-gray-900 dark:text-white",
                userPreview__userButton: "text-gray-900 dark:text-white",
                userPreviewAvatarImage: "text-gray-900 dark:text-white",
                profileSectionTitleText__profile:
                  "text-gray-900 dark:text-white",
                profileSectionTitleText__activeDevices:
                  "text-gray-900 dark:text-white",
                profileSectionTitleText__connectedAccounts:
                  "text-gray-900 dark:text-white",
              },
            }}
          />
        </SignedIn>
      </div>
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
