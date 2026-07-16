import UserModel, { User } from "@/models/user";
import dbConnect from "@/lib/dbConnect";
import { NextRequest } from "next/server";
import generateRegistrationNumber from "@/helpers/regNoGeneration";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { SendConfiramtionEmail } from "@/helpers/sendConfirmationEmail";
import { SendWhatApp } from "@/helpers/sendWhatsApp";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

interface CloudinaryUploadresult {
  public_id: string;
  [key: string]: any;
}
interface seller_partner {
  partner_name: string;
  partner_country_code: string;
  partner_mobile: string;
}
interface seller_team {
  team_name: string;
  team_country_code: string;
  team_mobile: string;
}

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const regData = (await request.json()) as User & { photoBase64: string } & {
      seller_partner: seller_partner[];
    } & { seller_team: seller_team[] };

    const allNumbers: string[] = [
      `${regData.country_code}${regData.mobile}`,
      ...(regData.seller_partner || []).map(
        (p: seller_partner) => `${p.partner_country_code}${p.partner_mobile}`
      ),
      ...(regData.seller_team || []).map(
        (t: seller_team) => `${t.team_country_code}${t.team_mobile}`
      ),
    ];

    const foundUsers = await UserModel.find({
      $or: allNumbers.map((num) => ({
        $expr: {
          $eq: [{ $concat: ["$country_code", "$mobile"] }, num],
        },
      })),
    });

    if (foundUsers.length > 0) {
      const existingNumbers = foundUsers.map(
        (u) => `${u.country_code}${u.mobile}`
      );
      return Response.json(
        {
          success: false,
          message: `Mobile numbers already registered: ${[
            ...new Set(existingNumbers),
          ].join(", ")}`,
        },
        { status: 409 }
      );
    }

    const reg_no = await generateRegistrationNumber("Seller");

    if (!reg_no || reg_no.length == 0) {
      return Response.json(
        { success: false, message: "Registration Number not generated" },
        { status: 400 }
      );
    }
    let photoUrl = "";
    if (regData.photoBase64) {
      const result = await new Promise<CloudinaryUploadresult>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload(
            regData.photoBase64,
            {
              folder: "DelhiFashion",
              public_id: reg_no,
              upload_preset: "delhiFashion",
              resource_type: "image",
              overwrite: true,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as CloudinaryUploadresult);
            }
          );
        }
      );
      console.log(result);
      photoUrl = result.secure_url;
    }

    const newUser = await UserModel.create({
      ...regData,
      reg_no,
      photo_url: photoUrl,
    });

    const result = await SendConfiramtionEmail(newUser._id as string);
    const result2 = await SendWhatApp(newUser._id as string);

    // Save partner entries
    for (const partner of regData.seller_partner || []) {
      const partnerRegNo = await generateRegistrationNumber("Seller");

      await UserModel.create({
        reg_no: partnerRegNo,
        reg_category: "Partner",
        name: partner.partner_name,
        mobile: partner.partner_mobile,
        country_code: partner.partner_country_code,
        company: regData.company,
        city: regData.city,
        state: regData.state,
        country: regData.country,
        email: "", // optional
        photo_url: "", // optional
        attend_date: [],
        reg_status: false,
      });
    }

    // Save team entries
    for (const team of regData.seller_team || []) {
      const teamRegNo = await generateRegistrationNumber("Seller");

      await UserModel.create({
        reg_no: teamRegNo,
        reg_category: "Team",
        name: team.team_name,
        mobile: team.team_mobile,
        country_code: team.team_country_code,
        company: regData.company,
        city: regData.city,
        state: regData.state,
        country: regData.country,
        email: "", // optional
        photo_url: "", // optional
        attend_date: [],
        reg_status: false,
      });
    }

    return Response.json(
      { success: true, message: "Registration done successfully" },
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
