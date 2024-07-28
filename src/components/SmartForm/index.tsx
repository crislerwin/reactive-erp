import { type HTMLAttributes, type ReactNode, useEffect } from "react";
import {
  type FieldValues,
  FormProvider,
  type SubmitHandler,
  type UseFormProps,
  type UseFormReturn,
  useForm,
} from "react-hook-form";

type OmitHtmlFormAttributes = Omit<
  HTMLAttributes<HTMLFormElement>,
  "onSubmit" | "defaultValue"
>;

interface SmartFormProps<
  TInput extends FieldValues,
  TOutput extends FieldValues
> extends OmitHtmlFormAttributes {
  /**
   * The children to be rendered in the form.
   */
  children: ReactNode;
  /**
   * The function to be called when submit event is fired. It's optional, because you can have a case where you would like to pass the submit function to the children component and fire it from there.
   */
  onSubmit?: TOutput extends undefined
    ? SubmitHandler<TInput>
    : TOutput extends FieldValues
    ? SubmitHandler<TOutput>
    : never;
  /**
   * The options to be passed to the useForm hook to configure the form.
   */
  options?: Omit<UseFormProps<TInput>, "defaultValues">;
  /**
   * The default values of the form.
   */
  defaultValues?: UseFormProps<TInput>["defaultValues"];
  /**
   * Set display: grid; to use with input colspan.
   */
  resetFormAfterSubmit?: Parameters<UseFormReturn<TInput>["reset"]>[0];
  /**
   * If this props is true, the form will not propagate the submit events up the tree. Makes sense when you have nested forms
   */
  isNestedForm?: boolean;
}

/**
 * This form is intended to be used to work with uncontrolled components and exposes a react hook form context.
 * You can access its context from within the provider using the `useFormContext` hook.
 */
export function SmartForm<
  TInput extends FieldValues = FieldValues,
  TOutput extends FieldValues = FieldValues
>({
  children,
  onSubmit,
  options,
  defaultValues,
  resetFormAfterSubmit,
  isNestedForm,
  ...props
}: SmartFormProps<TInput, TOutput>) {
  const methods = useForm<TInput, unknown, TOutput>({
    ...options,
    defaultValues,
  });

  const { isSubmitSuccessful } = methods.formState;
  const { reset } = methods;
  const handleResetAfterSubmit = () => {
    if (resetFormAfterSubmit) {
      reset(resetFormAfterSubmit);
    }
  };

  useEffect(handleResetAfterSubmit, [
    resetFormAfterSubmit,
    isSubmitSuccessful,
    reset,
  ]);

  return (
    <FormProvider {...methods}>
      <form
        {...props}
        noValidate
        onSubmit={
          onSubmit
            ? (ev) => {
                if (isNestedForm) ev.stopPropagation();
                return methods.handleSubmit(onSubmit)(ev);
              }
            : undefined
        }
      >
        {children}
      </form>
    </FormProvider>
  );
}
