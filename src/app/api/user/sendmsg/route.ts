import { SendWhatApp } from "@/helpers/sendWhatsApp";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const { id } = await request.json();

    const userExists = await UserModel.findById(id);

    if (!userExists) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 400 }
      );
    }

    // const result = await SendConfiramtionEmail(newUser._id as string);
    const result2 = await SendWhatApp(userExists._id as string);

    if (!result2.success) {
      return Response.json(
        { success: false, message: "MSg Failed" },
        { status: 400 }
      );
    }

    return Response.json(
      { success: true, message: "MSg Failed" },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in registering User", error);

    return Response.json(
      { success: false, message: "Error in registering User" },
      { status: 500 }
    );
  }
}
