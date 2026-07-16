import { z } from "zod";

export const UpdateSellerSchema = z.object({
  name: z.string().min(1, "Name is required"),

  email: z
    .string()
    .min(1, "Email Id is required")
    .email({ message: "please enter a valid email id" }),
  country_code: z
    .string()
    .regex(/^[+0-9]{3}$/, "Please enter a valid country code"),
  mobile: z
    .string()
    .regex(/^[0-9]{10,13}$/, "Phone number must be a valid  number"),
  company: z.string().min(1, "Company is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
});
