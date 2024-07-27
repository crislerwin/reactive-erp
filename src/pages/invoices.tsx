import { SideMenu } from "@/components/SideMenu";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";

export default function InvoicesPage() {
  return <SideMenu>AAA</SideMenu>;
}

export function getServerSideProps(ctx: CreateNextContextOptions) {
  return {
    props: {},
  };
}
