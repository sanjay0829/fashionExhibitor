import { Adminuser } from "@/models/admin";
import { User } from "@/models/user";

export interface ApiResponse {
  success: boolean;
  message: string;
  user?: User;
  userList?: User[];
  admin?: Adminuser;
  adminusers?: Adminuser[];
}
