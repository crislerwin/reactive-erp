import { type ZodError, type ZodSchema } from "zod";

export function validateData<T extends Record<string, unknown>>(
  data: T,
  schema: ZodSchema
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

export function parseToStringArray<T extends Record<string, unknown>>(
  data: T[]
): Record<string, string>[] {
  return data.map((item) => {
    const newItem: Record<string, string> = {};
    Object.entries(item).forEach(([key, value]) => {
      newItem[key] = String(value);
    });
    return newItem;
  });
}
