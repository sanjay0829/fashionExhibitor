import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export const getTokenData = (request: NextRequest) => {
  try {
    const token = request.cookies.get("token")?.value || "";

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY!
    ) as jwt.JwtPayload;

    return decoded.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAdminToken = (request: NextRequest) => {
  try {
    const token = request.cookies.get("admintoken")?.value || "";

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY!
    ) as jwt.JwtPayload;

    return decoded.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
