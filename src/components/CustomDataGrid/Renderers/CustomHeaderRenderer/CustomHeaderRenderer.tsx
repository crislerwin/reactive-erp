import { type CalculatedColumn } from "react-data-grid";

export const CustomHeaderRenderer: CalculatedColumn<
  unknown,
  unknown
>["headerRenderer"] = (props) => {
  return <div className="text-white">{props.column.name}</div>;
};
