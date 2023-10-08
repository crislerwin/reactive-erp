import { getAuth } from "@clerk/nextjs/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { SideBar } from "@/components/SideBar";
import { useMutation } from "@tanstack/react-query";
import { handleOpenAIRequest } from "@/services/llm.service";
import { Input } from "@mantine/core";
import { useState } from "react";

function Home() {
  const { data, mutate } = useMutation(handleOpenAIRequest);
  const [prompt, setPrompt] = useState("");
  return (
    <SideBar>
      <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <button onClick={() => mutate({ prompt })}>Send</button>
      <p>{data}</p>
    </SideBar>
  );
}
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
