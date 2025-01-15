import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  normalizeString,
  parseToStringArray,
  stringToBool,
  validateData,
} from "./utils";
describe("Utils", () => {
  describe("validateData", () => {
    it("should return an empty object for valid data", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const data = {
        name: "John Doe",
        age: 30,
      };

      const result = validateData(data, schema);

      expect(result).toEqual({});
    });

    it("should return errors for invalid data", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const data = {
        name: "John Doe",
        age: "thirty",
      };

      const result = validateData(data, schema);

      expect(result).toEqual({
        age: "Expected number, received string",
      });
    });

    it("should handle nested objects correctly", () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          address: z.object({
            city: z.string(),
            zip: z.string().length(5),
          }),
        }),
      });

      const data = {
        user: {
          name: "John Doe",
          address: {
            city: "Somewhere",
            zip: "123", // Invalid length
          },
        },
      };

      const result = validateData(data, schema);

      expect(result).toEqual({
        "user.address.zip": "String must contain exactly 5 character(s)",
      });
    });

    it("should return multiple errors", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const data = {
        name: 123, // Invalid type
        age: "thirty", // Invalid type
      };

      const result = validateData(data, schema);

      expect(result).toEqual({
        name: "Expected string, received number",
        age: "Expected number, received string",
      });
    });
  });
  describe("parseToStringArray", () => {
    it("should convert an array of objects to an array of stringified objects", () => {
      const data = [
        {
          name: "John Doe",
          age: 30,
        },
        {
          name: "Jane Doe",
          age: 25,
        },
      ];

      const result = parseToStringArray(data);

      expect(result).toEqual([
        {
          name: "John Doe",
          age: "30",
        },
        {
          name: "Jane Doe",
          age: "25",
        },
      ]);
    });
  });

  describe("normalizeString", () => {
    it("should handle undefined input", () => {
      expect(normalizeString(undefined)).toBe("");
    });

    it("should normalize accented characters", () => {
      expect(normalizeString("áéíóú")).toBe("aeiou");
    });

    it("should convert to lowercase and trim", () => {
      expect(normalizeString("  HELLO WORLD  ")).toBe("hello world");
    });

    it("should handle mixed case and accents", () => {
      expect(normalizeString("  OLÁ MUNDO  ")).toBe("ola mundo");
    });
  });

  describe("stringToBool", () => {
    it("should convert common true values", () => {
      expect(stringToBool("sim")).toBe(true);
      expect(stringToBool("yes")).toBe(true);
      expect(stringToBool("true")).toBe(true);
      expect(stringToBool("verdadeiro")).toBe(true);
    });

    it("should convert common false values", () => {
      expect(stringToBool("nao")).toBe(false);
      expect(stringToBool("no")).toBe(false);
      expect(stringToBool("false")).toBe(false);
      expect(stringToBool("falso")).toBe(false);
    });

    it("should handle case-insensitive input", () => {
      expect(stringToBool("SIM")).toBe(true);
      expect(stringToBool("NAO")).toBe(false);
    });

    it("should handle accented input", () => {
      expect(stringToBool("não")).toBe(false);
    });

    it("should use custom dictionary when provided", () => {
      const customDict = { "custom-true": true, "custom-false": false };
      expect(stringToBool("custom-true", true, true, customDict)).toBe(true);
      expect(stringToBool("custom-false", true, true, customDict)).toBe(false);
    });

    it("should respect dictOnly parameter", () => {
      expect(stringToBool("any-string", false)).toBe(true);
      expect(stringToBool("", false)).toBe(false);
    });
  });
});
