import { SignUp } from "@clerk/nextjs";
import type { NextPage } from "next";

const SignupPage: NextPage = () => {
  return (
    <div className="m-40 flex justify-center">
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </div>
  );
};

export default SignupPage;
