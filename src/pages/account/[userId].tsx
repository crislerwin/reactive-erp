import { SignedIn, UserProfile } from "@clerk/nextjs";

const AccountPage = () => {
  return (
    <div className="h-ful3 mt-5 flex w-full flex-col items-center justify-center overflow-auto rounded-sm dark:bg-gray-800">
      <SignedIn>
        <UserProfile
          appearance={{
            elements: {
              card: "dark:bg-gray-800  text-gray-900 dark:text-white",
              headerTitle: "text-gray-900 dark:text-white",
              headerSubtitle: "text-gray-900 dark:text-white",
              headerCloseButton: "text-gray-900 dark:text-white",
              header: "bg-white dark:bg-gray-800",
              accordionContent: "text-gray-900 dark:text-white",
              accordionTriggerButton: "text-gray-900 dark:text-white",
              activeDeviceIcon: "text-gray-900 dark:text-white",
              activeDeviceIcon__desktop: "text-gray-900 dark:text-white",
              activeDeviceIcon__mobile: "text-gray-900 dark:text-white",
              alert: "text-gray-900 dark:text-white",
              navbar: "bg-white dark:bg-gray-800",
              navbarButton: "text-gray-900 dark:white",
              navbarButton__account: "text-gray-900 dark:text-white",
              userPreview__userButton: "text-gray-900 dark:text-white",
              userPreviewAvatarImage: "text-gray-900 dark:text-white",
              profileSectionTitleText__profile: "text-gray-900 dark:text-white",
              profileSectionTitleText__activeDevices:
                "text-gray-900 dark:text-white",
              profileSectionTitleText__connectedAccounts:
                "text-gray-900 dark:text-white",
            },
          }}
        />
      </SignedIn>
    </div>
  );
};

export default AccountPage;
