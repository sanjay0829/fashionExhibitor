import dbConnect from "@/lib/dbConnect";
import PredataModel, { PreData } from "@/models/predata";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const data = (await request.json()) as PreData;

    const userExists = await PredataModel.findOne({
      country_code: data.country_code,
      mobile: data.mobile,
    });

    if (userExists) {
      return Response.json(
        { success: false, message: "Mobile Number Already Exists" },
        { status: 400 }
      );
    }

    const newuser = await PredataModel.create(data);

    return Response.json(
      { success: true, message: "Data Added Successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in adding Data", error);
    return Response.json(
      { success: false, message: "Error in Adding Data" },
      { status: 500 }
    );
  }
}
