import dbConnect from "@/lib/dbConnect";
import PredataModel from "@/models/predata";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const url = new URL(request.url);
    const searchText: string = url.searchParams.get("search") || "";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const users = await PredataModel.find({
      $and: [
        {
          $or: [
            { name: { $regex: searchText, $options: "i" } },

            { mobile: { $regex: searchText, $options: "i" } },
          ],
        },
      ],
    })
      .skip(skip)
      .limit(limit);

    // Fetch paginated results

    const totalCount = await PredataModel.countDocuments({
      $and: [
        {
          $or: [
            { name: { $regex: searchText, $options: "i" } },

            { mobile: { $regex: searchText, $options: "i" } },
          ],
        },
      ],
    });

    return Response.json(
      {
        success: true,
        message: "Users Found",
        userList: users,
        totalCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting Registration List", error);
    return Response.json(
      { success: false, message: "Error getting Registration List" },
      { status: 500 }
    );
  }
}
