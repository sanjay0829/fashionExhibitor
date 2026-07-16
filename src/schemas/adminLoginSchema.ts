import { z } from "zod";

export const AdminLoginSchema = z.object({
  login_id: z.string().min(1, "Login Id is required"),
  login_password: z.string().min(1, "Passowrd is required"),
});
