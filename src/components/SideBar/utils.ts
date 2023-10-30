import { filterItems } from "../SearchBar";

export const makeFilterItems = (search: string) => {
  return filterItems(
    [
      {
        heading: "Home",
        id: "home",
        items: [
          {
            id: "home",
            children: "Home",
            icon: "IconHome",
            href: "/",
          },
        ],
      },
      {
        heading: "Empresas",
        id: "companies",
        items: [
          {
            id: "companies",
            children: "Empresas",
            icon: "IconBuilding",
            href: "/companies",
          },
        ],
      },
      {
        heading: "Agendamentos",
        id: "schedule",

        items: [
          {
            id: "patients",
            children: "Pacientes",
            icon: "IconUsers",
            href: "/patients",
          },
        ],
      },
    ],
    search
  );
};
