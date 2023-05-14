import { type ButtonProps, type SearchLinkProps } from "./ListItem";

export type JsonStructure = Array<{
  items: Array<JsonStructureItem>;
  heading?: string;
  id: string;
}>;

export type JsonStructureItem = Omit<
  (ButtonProps & SearchLinkProps) & { id: string },
  "index"
>;
