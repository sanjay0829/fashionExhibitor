import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    // ✅ Get token from header
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        { success: false, message: "Unauthorized - No token" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];

    // ✅ Verify token
    if (token !== process.env.API_TOKEN) {
      return Response.json(
        { success: false, message: "Unauthorized - Invalid token" },
        { status: 401 },
      );
    }

    // ✅ Continue your logic
    const { searchParams } = new URL(request.url);
    const regdate = searchParams.get("regdate");

    let startDate: Date;
    let endDate: Date;

    if (regdate) {
      const date = new Date(regdate);
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const today = new Date();
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    }

    const userData = await UserModel.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).select("name mobile company createdAt -_id");

    return Response.json({ success: true, userData }, { status: 200 });
  } catch (error) {
    return Response.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
