import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user";

import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const url = new URL(request.url);
    const callType = url.searchParams.get("calltype");
    console.log(callType);

    //check calltype
    if (!callType) {
      return Response.json(
        {
          success: false,
          message: "Call Type is required",
        },
        { status: 400 }
      );
    }

    //Registration Counts
    if (callType == "counts") {
      const countData = await UserModel.aggregate([
        {
          $facet: {
            TOTAL_REG: [{ $count: "total" }],
          },
        },
        {
          $project: {
            TOTAL_REG: {
              $ifNull: [{ $arrayElemAt: ["$TOTAL_REG.total", 0] }, 0],
            },
          },
        },
      ]);

      return Response.json(
        {
          success: true,
          message: "Data found",
          countdata: countData,
        },
        { status: 200 }
      );
    }

    //For Last 7 days Registration Counts
    if (callType == "last7days") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

      console.log(sevenDaysAgo.getDate() + 1);

      const dateArray = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(sevenDaysAgo);
        date.setDate(sevenDaysAgo.getDate() + i);
        dateArray.push(date.toISOString().split("T")[0]); // Format as YYYY-MM-DD
      }

      const result = await UserModel.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo }, // Filter registrations from the last 7 days
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            }, // Group by date
            regcount: { $sum: 1 }, // Count registrations per day
          },
        },
        {
          $project: {
            _id: 0, // Remove _id
            reg_date: "$_id", // Rename _id to reg_date
            regcount: 1, // Keep count field
          },
        },
        {
          $sort: { reg_date: 1 }, // Sort by date ascending
        },
      ]);

      const finalResult = dateArray.map((date) => {
        const found = result.find((r) => r.reg_date === date);
        return found || { reg_date: date, count: 0 }; // If date not found, set count to 0
      });

      return Response.json(
        {
          success: true,
          message: "Data found",
          last7days: finalResult,
        },
        { status: 200 }
      );
    }

    //if nothing matches
    return Response.json(
      {
        success: false,
        message: "Call Type is not matching",
      },
      { status: 400 }
    );
  } catch (error) {
    console.log("Error in fetching report", error);

    return Response.json(
      {
        status: false,
        message: "Error in fetching report",
      },
      { status: 500 }
    );
  }
}
