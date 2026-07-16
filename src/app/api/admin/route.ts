import dbConnect from "@/lib/dbConnect";
import AdminModel, { Adminuser } from "@/models/admin";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const data = (await request.json()) as Adminuser;
    console.log(data);

    const adminExists = await AdminModel.findOne({ login_id: data.login_id });
    console.log(adminExists);

    if (adminExists) {
      return Response.json(
        { success: false, message: "Login Id is taken " },
        { status: 400 }
      );
    }

    const newAdmin = await AdminModel.create(data);
    return Response.json(
      { success: true, message: "Admin created successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in creating Admin", error);
    return Response.json(
      { success: false, message: "Error in adding admin user" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  await dbConnect();
  try {
    const url = new URL(request.url);

    const adminId = url.searchParams.get("adminId");

    if (!adminId) {
      return Response.json(
        { success: false, message: "Please provide admin id to update" },
        { status: 400 }
      );
    }

    const adminExists = await AdminModel.findById(adminId);

    if (!adminExists) {
      return Response.json(
        { success: false, message: "Admin not found for updation" },
        { status: 400 }
      );
    }

    const { admin_name, login_id, login_password, admin_type } =
      await request.json();

    const loginExists = await AdminModel.findOne({
      $and: [
        {
          login_id: {
            $regex: new RegExp(`^${login_id}$`, "i"),
          },
        },
        { _id: { $ne: adminId } },
      ],
    });

    if (loginExists) {
      return Response.json(
        { success: false, message: "Admin with login id already exists" },
        { status: 400 }
      );
    }

    const adminUpdated = await AdminModel.findByIdAndUpdate(
      adminId,
      {
        admin_name,
        login_id,
        login_password,
        admin_type,
      },
      { new: true }
    ).select("-login_password");

    // Convert Mongoose document to a plain object

    return Response.json(
      {
        success: true,
        message: "Admin updated successfully",
        adminuser: adminUpdated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in Updating Admin", error);

    return Response.json(
      { success: false, message: "Error in Updating Admin" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  await dbConnect();
  try {
    const url = new URL(request.url);

    const adminId = url.searchParams.get("adminId");

    if (adminId) {
      const adminuser = await AdminModel.findById(adminId);
      if (!adminuser) {
        return Response.json(
          {
            success: false,
            message: "Admin User not found",
          },
          { status: 400 }
        );
      }
      return Response.json(
        {
          success: true,
          message: "Admin user found",
          admin: adminuser,
        },
        { status: 200 }
      );
    }

    const adminUsers = await AdminModel.find();

    if (!adminUsers) {
      return Response.json(
        {
          success: false,
          message: "No Admin users to display",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Admin user found",
        adminusers: adminUsers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in getting Admin Users", error);

    return Response.json(
      { success: false, message: "Error in getting Admin Users" },
      { status: 500 }
    );
  }
}
