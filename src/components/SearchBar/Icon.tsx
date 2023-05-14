import React, { type SVGProps } from "react";
import { type IconName } from "./types";

export type IconType = "outline" | "solid";

export interface IconProps extends SVGProps<SVGSVGElement> {
  type?: IconType;
  name: IconName;
}

export default function Icon({ name, type = "solid", ...rest }: IconProps) {
  return <></>;
}
