export enum PageRoute {
  HOME = "/",
  STAFF = "/staff",
  BRANCH = "/branch",
  PRODUCTS = "/products",
}

export const pageNameMap: Record<PageRoute | string, string> = {
  [PageRoute.HOME]: "Visão Geral",
  [PageRoute.STAFF]: "Cadastro de Equipes",
  [PageRoute.BRANCH]: "Cadastro de Filiais",
  [PageRoute.PRODUCTS]: "Cadastro de Produtos",
};
