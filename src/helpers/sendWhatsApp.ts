"use server";
import { ApiResponse } from "@/types/ApiResponse";
import UserModel from "@/models/user";
import QRCode from "qrcode";
import { Client } from "basic-ftp";
import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";
import { saveAs } from "file-saver";
import { Readable } from "stream";
import axios from "axios";

registerFont(
  path.join(process.cwd(), "public", "fonts", "Amazon-Ember-Medium.ttf"),
  {
    family: "MyCustomFont",
  },
);

export async function SendWhatApp(id: string): Promise<ApiResponse> {
  try {
    const userData = await UserModel.findById(id);
    console.log("userData", userData);

    if (!userData) {
      return { success: false, message: "User Data not found" };
    }

    const qrCodeImage = await QRCode.toDataURL(userData.reg_no, {
      errorCorrectionLevel: "H",
      width: 250,
      margin: 1,
    });

    const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, "");

    const imageCanvas = createCanvas(100, 100);

    const ctx = imageCanvas.getContext("2d");
    let baseImage = await loadImage(
      path.join(process.cwd(), "public", "img", "backimg.jpg"),
    );
    imageCanvas.width = baseImage.width;
    imageCanvas.height = baseImage.height;
    ctx?.drawImage(baseImage, 0, 0);

    let overlayImage = await loadImage(`data:image/png;base64,${base64Data}`);
    ctx?.drawImage(overlayImage, 340, 1040, 350, 350);

    console.error("Canvas context is not available22");

    //ctx?.clearRect(0, 0, imageCanvas.width, imageCanvas.height); // Clear canvas
    ctx.font = "65px MyCustomFont";
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    const textX = imageCanvas.width / 2; // X position to center the text
    const textY = 585; //
    ctx.fillText(userData.name as string, 50, textY); // Position the text
    ctx.textAlign = "left";
    ctx.font = "50px MyCustomFont";
    ctx.fillText(userData.reg_no as string, 50, 810); // Position the text

    const buffer = imageCanvas.toBuffer("image/jpeg");
    // Strip data URL prefix

    const filename = `${userData.reg_no}.jpg`;

    const client = new Client();
    await client.access({
      host: "groupthink.in",
      user: "userAdmin08",
      password: "user_admin08",
      secure: false, // set to true if using FTPS
    });

    const stream = Readable.from(buffer);
    // await client.uploadFrom(
    //   stream,
    //   `/groupthink.events/delhifashion/${filename}`
    // );
    // await client.close();

    const finalBase64 = imageCanvas
      .toDataURL("image/jpeg")
      .replace(/^data:image\/jpeg;base64,/, "");

    //console.log("base64", finalBase64);

    const mobileNumber = userData.country_code + userData.mobile;
    const payload = {
      templateName: "dfc_buyer_confirmation",
      language: "en",
      to: mobileNumber,
      //fileUrl: `https://groupthink.events/delhifashion/${userData.reg_no}.jpg`,
      base64File: {
        name: `${userData.reg_no}.jpg`,
        body: finalBase64,
      },
      templateVariables: [userData.name, userData.reg_no],
    };

    const response = await axios.post(
      `https://wa.redlava.in/api/v1/whatsapp/sendMessage?phoneId=624882680715530&apiKey=94dc27db93e843fa31ec12b2e8017bbc9284fbe90acbef536d8e3245cc4bc85ba2070a91bca3767295afa75639dfb3cca3f9`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        maxBodyLength: Infinity,
      },
    );

    console.log("Response:", response.data);
    if (response.data.id) {
      return { success: true, message: "WhatsApp sent" };
    } else {
      return { success: false, message: "WhatsApp not sent" };
    }
  } catch (error) {
    console.error("Error sending confirmation WhatsApp", error);
    return { success: false, message: "Failed to send confirmation WhatsApp" };
  }
}
