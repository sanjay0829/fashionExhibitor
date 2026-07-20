import dbConnect from "@/lib/dbConnect";
import PredataModel, { PreData } from "@/models/predata";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const url = new URL(request.url);

    const userId = url.searchParams.get("id");

    const userExists = await PredataModel.findById(userId);

    if (!userExists) {
      return Response.json(
        { success: false, message: "User Not found" },
        { status: 400 },
      );
    }

    return Response.json(
      { success: true, message: "User Found", predata: userExists },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error getting Predata", error);
    return Response.json(
      { success: false, message: "Error getting Predata user" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  await dbConnect();
  try {
    const url = new URL(request.url);

    const userId = url.searchParams.get("id");

    const data = (await request.json()) as PreData;

    const userExists = await PredataModel.findById(userId);

    if (!userExists) {
      return Response.json(
        { success: false, message: "User Not found" },
        { status: 400 },
      );
    }

    const mobileExists = await PredataModel.findOne({
      mobile: data.mobile,
      _id: { $ne: userId },
    });

    if (mobileExists) {
      return Response.json(
        { success: false, message: "Mobile Number already Exists" },
        { status: 400 },
      );
    }

    const updatedUser = await PredataModel.findByIdAndUpdate(userId, data);

    return Response.json(
      { success: true, message: "User Found", predata: updatedUser },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error getting Predata", error);
    return Response.json(
      { success: false, message: "Error getting Predata user" },
      { status: 500 },
    );
  }
}
