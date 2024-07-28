export enum PageRoute {
  HOME = "/",
  STAFF = "/staff",
  BRANCH = "/branch",
  PRODUCTS = "/products",
  PRODUCT_CATEGORY = "/product-category",
  CUSTOMERS = "/customers",
  INVOICES = "/invoices",
}

export const pageNameMap: Record<PageRoute, string> = {
  [PageRoute.HOME]: "Visão Geral",
  [PageRoute.STAFF]: "Equipes",
  [PageRoute.BRANCH]: "Filiais",
  [PageRoute.PRODUCTS]: "Produtos",
  [PageRoute.PRODUCT_CATEGORY]: "Categorias de Produtos",
  [PageRoute.CUSTOMERS]: "Clientes",
  [PageRoute.INVOICES]: "Pedidos",
};

export const managerRoles = ["OWNER", "ADMIN", "MANAGER"];
export const superUserRoles = ["ADMIN", "OWNER"];
