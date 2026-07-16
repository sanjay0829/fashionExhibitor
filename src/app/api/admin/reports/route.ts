import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const url = new URL(request.url);
    const searchText: string = url.searchParams.get("search") as string;
    const category: string = url.searchParams.get("category") as string;

    console.log(category);

    const users = await UserModel.find({
      $and: [
        {
          $or: [
            { name: { $regex: searchText, $options: "i" } },
            { email: searchText },
            { mobile: { $regex: searchText, $options: "i" } },
            { reg_no: searchText },
          ],
        },
        ...(category ? [{ reg_category: category }] : []),
      ],
    });

    if (!users) {
      return Response.json(
        { success: false, message: "No Users found" },
        { status: 400 }
      );
    }

    return Response.json(
      { success: true, message: "Users Found", userList: users },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error getting Registration List", error);
    return Response.json(
      { success: false, message: "Error getting Registration List" },
      { status: 500 }
    );
  }
}
