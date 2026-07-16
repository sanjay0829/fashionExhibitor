import dbConnect from "@/lib/dbConnect";
import AdminModel from "@/models/admin";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { login_id, login_password } = await request.json();

    const adminData = await AdminModel.findOne({
      login_id,
      login_password,
    }).select("-login_password");

    if (!adminData) {
      return Response.json(
        { success: false, message: "invalid login credentials" },
        { status: 400 }
      );
    }

    const tokenData = {
      id: adminData._id,
      usertype: adminData.admin_type,
    };

    const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY!, {
      expiresIn: "1d",
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        adminuser: adminData,
      },
      { status: 200 }
    );
    response.cookies.set("admintoken", token, { httpOnly: true });

    return response;
  } catch (error) {
    console.log("Error in Admin login", error);

    return Response.json(
      { success: false, message: "Error in Admin Login" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const response = NextResponse.json({
      success: true,
      message: "User logged out successfully",
    });

    response.cookies.set("admintoken", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.log("Error in Admin logout", error);

    return Response.json(
      { success: false, message: "Error in Admin logout" },
      { status: 500 }
    );
  }
}
