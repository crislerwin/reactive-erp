export enum PageRoute {
  HOME = "/",
  STAFF = "/staff",
  BRANCH = "/branch",
  PRODUCTS = "/products",
  PRODUCT_CATEGORY = "/product-category",
}

export const pageNameMap: Record<PageRoute | string, string> = {
  [PageRoute.HOME]: "Visão Geral",
  [PageRoute.STAFF]: "Cadastro de Equipes",
  [PageRoute.BRANCH]: "Cadastro de Filiais",
  [PageRoute.PRODUCTS]: "Cadastro de Produtos",
  [PageRoute.PRODUCT_CATEGORY]: "Cadastro de Categorias de Produtos",
};
