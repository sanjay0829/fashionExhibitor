import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  reg_category: z.string().min(1, "Category is required"),

  country_code: z
    .string()
    .regex(/^[+0-9]{2,5}$/, "Please enter a valid country code"),
  mobile: z
    .string()
    .regex(/^[0-9]{9,13}$/, "Phone number must be a valid  number"),
  company: z.string().min(1, "Company is required"),

  attend_date: z.array(z.string()).min(1, "Please select at least one date"),
});
