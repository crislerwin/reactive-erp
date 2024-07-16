import { describe, expect, it } from "vitest";
import { z } from "zod";
import { parseToStringArray, validateData } from "./utils";
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
});
