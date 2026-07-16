import { z } from "zod";

export const SellerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  reg_category: z.string().min(1, "Category is required"),

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
  seller_partner: z
    .array(
      z.object({
        partner_name: z.string().min(3, "Name is required"),
        partner_mobile: z
          .string()
          .regex(/^[0-9]{10,13}$/, "Phone number must be a valid  number"),
        partner_country_code: z
          .string()
          .regex(/^[+0-9]{3}$/, "Please enter a valid country code"),
      })
    )
    .optional(),
  seller_team: z
    .array(
      z.object({
        team_name: z.string().min(3, "Name is required"),
        team_mobile: z
          .string()
          .regex(/^[0-9]{10,13}$/, "Phone number must be a valid  number"),
        team_country_code: z
          .string()
          .regex(/^[+0-9]{3}$/, "Please enter a valid country code"),
      })
    )
    .optional(),
});
