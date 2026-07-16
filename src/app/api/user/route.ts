import UserModel, { User } from "@/models/user";
import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import generateRegistrationNumber from "@/helpers/regNoGeneration";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { SendConfiramtionEmail } from "@/helpers/sendConfirmationEmail";
import { SendWhatApp } from "@/helpers/sendWhatsApp";
import { getTokenData } from "@/helpers/getTokenData";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

interface CloudinaryUploadresult {
  public_id: string;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const regData = (await request.json()) as User & { photoBase64: string };

    const userExists = await UserModel.findOne({ mobile: regData.mobile });

    if (userExists) {
      return Response.json(
        { success: false, message: "Mobile No. already registered" },
        { status: 400 },
      );
    }

    const reg_no = await generateRegistrationNumber(regData.reg_category);

    if (!reg_no || reg_no.length == 0) {
      return Response.json(
        { success: false, message: "Registration Number not generated" },
        { status: 400 },
      );
    }
    let photoUrl = "";
    if (regData.photoBase64) {
      const result = await new Promise<CloudinaryUploadresult>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload(
            regData.photoBase64,
            {
              folder: "dermacon",
              public_id: reg_no,
              upload_preset: "fordermacon",
              resource_type: "image",
              overwrite: true,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as CloudinaryUploadresult);
            },
          );
        },
      );
      console.log(result);
      photoUrl = result.secure_url;
    }

    const newUser = await UserModel.create({
      ...regData,
      reg_no,
      photo_url: photoUrl,
    });

    // const result = await SendConfiramtionEmail(newUser._id as string);
    const result2 = await SendWhatApp(newUser._id as string);

    const response = NextResponse.json(
      {
        success: true,
        message: "Registration done successfully",
      },
      { status: 200 },
    );
    response.cookies.set("token", "", { httpOnly: true, expires: new Date(0) });

    return response;
  } catch (error) {
    console.log("Error in registering User", error);

    return Response.json(
      { success: false, message: "Error in registering User" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  await dbConnect();
  try {
    const userId = getTokenData(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Invalid / Expired User Login" },
        { status: 400 },
      );
    }

    const userExists = await UserModel.findById(userId);

    if (!userExists) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 400 },
      );
    }

    const regData = (await request.json()) as User & { photoBase64: string };

    let photoUrl = "";
    if (regData.photoBase64) {
      const result = await new Promise<CloudinaryUploadresult>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload(
            regData.photoBase64,
            {
              folder: "DelhiFashion",
              public_id: userExists.reg_no,
              upload_preset: "delhiFashion",
              resource_type: "image",
              overwrite: true,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as CloudinaryUploadresult);
            },
          );
        },
      );
      console.log(result);
      photoUrl = result.secure_url;
    }

    const newUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        ...regData,
        photo_url: photoUrl,
        reg_status: true,
      },
      { new: true },
    );

    const result = await SendConfiramtionEmail(newUser!._id as string);
    const result2 = await SendWhatApp(newUser!._id as string);

    return Response.json(
      { success: true, message: "Registration done successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.log("Error in registering User", error);

    return Response.json(
      { success: false, message: "Error in registering User" },
      { status: 500 },
    );
  }
}
