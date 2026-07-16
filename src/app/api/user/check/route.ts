import { getTokenData } from "@/helpers/getTokenData";
import dbConnect from "@/lib/dbConnect";
import PredataModel from "@/models/predata";
import UserModel from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const userId = getTokenData(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Invalid / Expired User Login" },
        { status: 400 }
      );
    }

    const userExists = await PredataModel.findById(userId);

    if (!userExists) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User details successfully found",
      user: userExists,
    });
  } catch (error) {
    console.log("Error in getting User Details", error);
    return NextResponse.json(
      { success: false, message: "Error in getting User Details" },
      { status: 500 }
    );
  }
}
