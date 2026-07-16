"use server";
import { ApiResponse } from "@/types/ApiResponse";

import axios from "axios";

export async function SendOtp(
  mobile: string,
  otp: string
): Promise<ApiResponse> {
  try {
    const mobileNumber = mobile;
    const payload = {
      templateName: "otp_verification",
      language: "en",
      to: mobileNumber,

      templateVariables: [otp],
    };

    const response = await axios.post(
      `https://wa.redlava.in/api/v1/whatsapp/sendMessage?phoneId=624882680715530&apiKey=94dc27db93e843fa31ec12b2e8017bbc9284fbe90acbef536d8e3245cc4bc85ba2070a91bca3767295afa75639dfb3cca3f9`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        maxBodyLength: Infinity,
      }
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
