export enum PageRoute {
  HOME = "/",
  STAFF = "/staff",
  BRANCH = "/branch",
  PRODUCTS = "/products",
  PRODUCT_CATEGORY = "/product-category",
}

export const pageNameMap: Record<PageRoute | string, string> = {
  [PageRoute.HOME]: "Visão Geral",
  [PageRoute.STAFF]: "Equipes",
  [PageRoute.BRANCH]: "Filiais",
  [PageRoute.PRODUCTS]: "Produtos",
  [PageRoute.PRODUCT_CATEGORY]: "Categorias de Produtos",
};

export const managerRoles = ["OWNER", "ADMIN", "MANAGER"];
export const superUserRoles = ["ADMIN", "OWNER"];
