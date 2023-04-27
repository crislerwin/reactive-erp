import { SignUp } from "@clerk/nextjs";
import type { NextPage } from "next";

const SignupPage: NextPage = () => {
  return (
    <div>
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </div>
  );
};

export default SignupPage;
