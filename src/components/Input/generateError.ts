import { type FieldErrors, type FieldValues, get } from "react-hook-form";

export interface GenerateErrorsReturn {
  error?: string;
}

/**
 * Function to generate an object with helperText and error to prevent overriding the helperText when there're no errors
 * @param error Error from react-hook-form
 * @param name Input name
 * @returns an object with helperText and error
 */

export function generateErrors(
  errors: FieldErrors<FieldValues>,
  name: string
): GenerateErrorsReturn {
  const result: GenerateErrorsReturn = {};
  const parsedErrors = get(errors, name) as { message?: string } | undefined;

  if (parsedErrors?.message) {
    result.error = parsedErrors.message;
  }

  return result;
}
