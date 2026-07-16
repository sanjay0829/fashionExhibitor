"use server";
import { ApiResponse } from "@/types/ApiResponse";
import UserModel, { User } from "@/models/user";
import QRCode from "qrcode";
import { Client } from "basic-ftp";
import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";
import { saveAs } from "file-saver";
import { Readable } from "stream";
import axios from "axios";
import dbConnect from "@/lib/dbConnect";

registerFont(
  path.join(process.cwd(), "public", "fonts", "Amazon-Ember-Medium.ttf"),
  {
    family: "MyCustomFont",
  }
);

export async function generateUserImage(userData: User): Promise<Buffer> {
  try {
    const qrCodeImage = await QRCode.toDataURL(userData.reg_no, {
      errorCorrectionLevel: "H",
      width: 250,
      margin: 1,
    });

    const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, "");

    const baseImage = await loadImage(
      path.join(process.cwd(), "public", "img", "backimg.jpg")
    );

    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(baseImage, 0, 0);

    const overlayImage = await loadImage(`data:image/png;base64,${base64Data}`);
    ctx.drawImage(overlayImage, 340, 1040, 350, 350);

    // Name
    ctx.font = "65px MyCustomFont";
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    ctx.fillText(userData.name, 50, 585);

    // Reg No
    ctx.font = "50px MyCustomFont";
    ctx.fillText(userData.reg_no, 50, 810);

    return canvas.toBuffer("image/jpeg");
  } catch (error) {
    console.error("Error sending confirmation WhatsApp", error);
    throw error; // ✅ important
  }
}

export async function generateAndUploadAllUsers() {
  await dbConnect();
  const users = await UserModel.find({}); // or add filter if needed
  console.log(users);

  if (!users.length) {
    return { success: false, message: "No users found" };
  }

  const client = new Client();

  try {
    await client.access({
      host: "groupthink.in",
      user: "userAdmin08",
      password: "user_admin08",
      secure: false,
    });

    for (const user of users) {
      if (!user.reg_no || !user.name) continue;

      const buffer = await generateUserImage(user);
      const filename = `${user.reg_no}.jpg`;

      const stream = Readable.from(buffer);

      await client.uploadFrom(
        stream,
        `/feedback.groupthink.events/dfc/${filename}`
      );

      console.log(`Uploaded: ${filename}`);
    }

    return { success: true, message: "All user images uploaded" };
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error;
  } finally {
    client.close();
  }
}
