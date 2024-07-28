import React, { type ReactElement, useCallback } from "react";
import {
  type FieldValues,
  type Path,
  type RegisterOptions,
  useFormContext,
} from "react-hook-form";
import debounce from "lodash.debounce";
import { generateErrors } from "./generateError";

export interface InputFormProps<T extends FieldValues> {
  children: ReactElement;
  name: Path<T>;
  options?: RegisterOptions;
  onBlur?: (e: InputEvent) => void;
  onChange?: (e: InputEvent) => void;
  debounceTime?: number;
  inputType?: "input" | "select";
}

export function InputForm<T extends FieldValues>({
  children,
  name,
  options,
  onBlur,
  onChange,
  debounceTime,
  inputType: type = "input",
}: InputFormProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const {
    onBlur: registerOnBlur,
    onChange: registerOnChange,
    ...registerProps
  } = register(name, options);

  const selectOnChange = async (value: string) => {
    await registerOnChange({ target: { value } });
  };
  const nativeOnchange = async (e: InputEvent) => {
    await registerOnChange(e);
    onChange?.(e);
  };
  const nativeOnchangeDebounced = useCallback(() => {
    return debounceTime
      ? debounce(
          type === "input" ? nativeOnchange : selectOnChange,
          debounceTime
        )
      : nativeOnchange;
  }, [type, debounceTime]);

  return (
    <>
      {React.cloneElement(children, {
        onBlur: async (e: InputEvent) => {
          await registerOnBlur(e);
          onBlur?.(e);
        },
        onChange: nativeOnchangeDebounced(),
        ...registerProps,
        ...generateErrors(errors, name),
      })}
    </>
  );
}
