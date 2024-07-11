import { type ZodError, type ZodSchema } from "zod";

export function validateData<T extends Record<string, unknown>>(
  data: T,
  schema: ZodSchema<T>
): Record<string, string | undefined> {
  const errors: Record<string, string | undefined> = {};
  try {
    schema.parse(data);
  } catch (err) {
    const error = err as ZodError<T>;
    error.errors.forEach((issue) => {
      const path = issue.path.join(".");
      errors[path] = issue.message;
    });
  }
  return errors;
}
