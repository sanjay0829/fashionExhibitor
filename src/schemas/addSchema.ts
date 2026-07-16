import { z } from "zod";

export const AddSchema = z.object({
  name: z.string().min(1, "Name is required"),

  country_code: z
    .string()
    .regex(/^[+0-9]{2,5}$/, "Please enter a valid country code"),
  mobile: z
    .string()
    .regex(/^[0-9]{6,13}$/, "Phone number must be a valid  number"),
  company: z.string().optional(),
  city: z.string().optional(),
});
