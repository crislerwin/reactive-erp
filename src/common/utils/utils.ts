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
type StringToBoolMap = { [key: string]: boolean };

const defaultStringToBooleanMap: StringToBoolMap = {
  sim: true,
  yes: true,
  true: true,
  verdadeiro: true,
  nao: false,
  no: false,
  false: false,
  falso: false,
};

export const normalizeString = (value: string | undefined): string => {
  if (!value) return "";
  return value
    ?.trim()
    .toString()
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export const customBoolDict = {
  ...defaultStringToBooleanMap,
  "1": true,
  s: true,
  y: true,
  "0": false,
  n: false,
};

export const stringToBool = (
  value: string,
  dictOnly = true,
  normalize = true,
  dictionary: StringToBoolMap = defaultStringToBooleanMap
): boolean => {
  const normalizedValue = normalize ? normalizeString(value) : value;
  const dictTry = dictionary[normalizedValue];
  const dictOnlyCheck = dictOnly ? false : Boolean(normalizedValue);

  return dictTry != null ? dictTry : dictOnlyCheck;
};
