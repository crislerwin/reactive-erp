import { TextInput, type TextInputProps } from "@mantine/core";
import { forwardRef } from "react";
import { InputForm, type InputFormProps } from "./InputForm";
import { type FieldValues } from "react-hook-form";

export type InputRootProps = TextInputProps &
  Omit<InputFormProps<FieldValues>, "children">;

export const TextField = forwardRef<HTMLInputElement, InputRootProps>(
  (props, ref) => {
    return (
      <InputForm {...props}>
        <TextInput {...props} ref={ref} />
      </InputForm>
    );
  }
);

TextField.displayName = "@mantine/core/InputRoot";
