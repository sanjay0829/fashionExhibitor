import dbConnect from "@/lib/dbConnect";
import PredataModel from "@/models/predata";
import UserModel from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const url = new URL(request.url);
    const mobile = url.searchParams.get("mobile") as string;
    const country_code = url.searchParams.get("country_code") as string;

    if (!mobile) {
      return NextResponse.json(
        { success: false, message: "Provide mobile number to check" },
        { status: 400 }
      );
    }

    console.log("mobile", country_code, mobile);

    const userExists = await PredataModel.findOne({ mobile });

    console.log("user", userExists);

    if (!userExists) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Sorry, this mobile number is not in the invitation list. Please contact your agent or the exhibition management team for help",
        },
        { status: 400 }
      );
    }

    const userExistsInReg = await UserModel.findOne({ country_code, mobile });

    if (userExistsInReg) {
      return NextResponse.json(
        {
          success: false,
          message: "Registration is already completed for this mobile number",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration found",
        user: userExists,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in checking mobile number", error);
    return NextResponse.json(
      { success: false, message: "Error in checking mobile number" },
      { status: 500 }
    );
  }
}
