import { SignedIn, UserProfile } from "@clerk/nextjs";
import { type NextPage } from "next";
import { SideBar } from "@/components/SideBar";

const Profile: NextPage = () => {
  return (
    <SideBar>
      <div className="flex h-full w-full flex-col items-center justify-center">
        <SignedIn>
          <UserProfile />
        </SignedIn>
      </div>
    </SideBar>
  );
};

export default Profile;
