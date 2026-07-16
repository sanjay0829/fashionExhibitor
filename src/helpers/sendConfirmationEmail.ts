"use server";
import { MailService } from "@sendgrid/mail";

import { ApiResponse } from "@/types/ApiResponse";
import UserModel from "@/models/user";

const sgMail = new MailService();
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

export async function SendConfiramtionEmail(id: string): Promise<ApiResponse> {
  try {
    const userData = await UserModel.findById(id);

    if (!userData) {
      return { success: false, message: "User Data not found" };
    }

    const response = sgMail.send({
      from: {
        email: "noreply@groupthink.events",
        name: "Delhi Fashion Creators",
      },
      bcc: { email: "vrglobal.24@gmail.com" },
      to: userData.email,
      subject: "Registration Confirmation - Delhi Fashion Creators'25",
      html: `<div
        style='max-width:800px; width:90%; background-color: #000; margin:10px auto; border: 1px solid #ccc; font-family:  "Lucida sans",  sans-serif; font-size:1rem;padding:10px;'>
         <div style="background-color:white; padding:5px;">  
        <img src="https://aicogcertificate.vercel.app/img/header.jpg" alt="" style="width: 100%; max-width:300px;">
        </div> 
        <div style="background-color: #fff; border-radius: 10px; padding: 10px; margin-top: 10px;">
         <p><b>Dear ${userData.name}</b></p>
         <p>Thank you for registering.  Please find below your    registration details.</p>
            <p>You are requested to kindly use the same for any future correspondence. Also, please keep a track of
                emails from this mail ID.</p>

            <h3 style="padding: 5px 7px; background-color: #000; color: #fff;">REGISTRATION DETAILS</h3>
             <table border="1" cellspacing="0" cellpadding="5">
                <tr>
                    <td><b>Registration Type</b></td>
                    <td>:</td>
                    <td>${userData.reg_category}</td>
                </tr>  
                 <tr>
                    <td><b>Registration Number</b></td>
                    <td>:</td>
                    <td>${userData.reg_no}</td>
                </tr>  
                <tr>
                    <td colspan='3' style='text-align:center;'>
                      <img src='https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${userData.reg_no}' 
                      style="width:250px; height:250px;"/>
                    </td>
                   
                </tr>  
            </table>
            
           
       
            <p>Looking forward to welcoming you at <b> Delhi Fashion Creators, Delhi</b></p>
            <br>
            <p>
                <b>Thanks & Regards</b><br>
                Team <br>
                Delhi Fashion Creators
            </p>
        </div>
    </div>       

        `,
    });
    console.log("responsesmail", response);

    return { success: true, message: "Confirmation email sent" };
  } catch (error) {
    console.error("Error sending confirmation email", error);
    return { success: false, message: "Failed to send confirmation email" };
  }
}
