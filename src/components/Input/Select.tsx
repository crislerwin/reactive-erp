import {
  Select as MantineSelect,
  type SelectProps as MantineSelectProps,
} from "@mantine/core";
import { Controller, useFormContext } from "react-hook-form";
import { forwardRef } from "react";
import { generateErrors } from "./generateError";

export type SelectProps = MantineSelectProps & {
  name: string;
};

export const InputSelect = forwardRef<HTMLInputElement, SelectProps>(
  (props, ref) => {
    const {
      control,
      formState: { errors },
    } = useFormContext();
    const parsedErrors = generateErrors(errors, props.name);
    return (
      <Controller
        control={control}
        name={props.name}
        render={({ field }) => (
          <MantineSelect {...parsedErrors} {...field} {...props} ref={ref} />
        )}
      />
    );
  }
);

InputSelect.displayName = "@mantine/core/InputSelect";
