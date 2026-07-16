import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import PredataModel from "@/models/predata";

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const { id } = await request.json();

    const userExists = await PredataModel.findById(id);

    if (!userExists) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 400 }
      );
    }

    const tokenData = {
      id: userExists.id,
    };

    const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY!, {
      expiresIn: "1d",
    });

    const response = NextResponse.json(
      { success: true, message: "User Logged in successfully" },
      { status: 200 }
    );

    response.cookies.set("token", token, { httpOnly: true });

    return response;
  } catch (error) {
    console.log("Error in Login", error);
    return NextResponse.json(
      { success: false, message: "Error in Login" },
      { status: 500 }
    );
  }
}
