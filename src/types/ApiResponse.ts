import { Adminuser } from "@/models/admin";
import { PreData } from "@/models/predata";
import { User } from "@/models/user";

export interface ApiResponse {
  success: boolean;
  message: string;
  user?: User;
  userList?: User[];
  admin?: Adminuser;
  adminusers?: Adminuser[];
  predata?: PreData;
  predataList?: PreData[];
}
