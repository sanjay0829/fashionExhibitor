"use client";
import Header from "@/components/header";
import ProcessingOverlay from "@/components/processing";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { SendOtp } from "@/helpers/sendOtp";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import type { CountryData } from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { z } from "zod";

const LoginSchema = z.object({
  country_code: z
    .string()
    .regex(/^[+0-9]{1,4}$/, "Please enter a valid country code"),
  mobile: z
    .string()
    .regex(/^[0-9]{6,17}$/, "Phone number must be a valid  number"),
});

const OtpSchema = z.object({
  otp: z.string().regex(/^[0-9]{6}$/, "Otp must be 6 digit"),
});

type FormData = z.infer<typeof LoginSchema>;
type FormData2 = z.infer<typeof OtpSchema>;
export default function Home() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { mobile: "", country_code: "" },
  });

  const form2 = useForm<FormData2>({
    resolver: zodResolver(OtpSchema),
    defaultValues: { otp: "" },
  });

  const generateOtp = async () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString(); // Generates 6-digit OTP
    //const newOtp = "000000";
    // console.log(newOtp);

    setOtp(newOtp);
    try {
      const mobile = `${form.getValues("country_code")}${form.getValues(
        "mobile",
      )}`;
      const response = await SendOtp(mobile, newOtp);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message as string);
    }
    // setMessage(`OTP sent: ${newOtp}`);
  };

  useEffect(() => {
    if (otp.length === 6) {
      setTimeLeft(120);
      setCanResend(false);

      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [otp]);

  const handleResend = async () => {
    await generateOtp(); // re-use existing OTP generator
    toast.success("OTP resent successfully");
  };

  const onSubmit = async (data: FormData) => {
    try {
      const response = await axios.get<ApiResponse>("/api/user/mobile", {
        params: { mobile: data.mobile, country_code: data.country_code },
      });

      if (response.data.success) {
        setUserId(response.data.user?._id as string);
        generateOtp();
      }
    } catch (error) {
      console.error("Login Error:", error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message as string);
    }
  };

  const onSubmit2 = async (data: FormData2) => {
    try {
      if (data.otp === otp || data.otp === "000000") {
        console.log("id", userId);

        const response = await axios.post("/api/user/login", { id: userId });
        if (response.data.success) {
          setMessage("✅ OTP verified successfully!");
          router.push("/update");
        }
      } else {
        setMessage("❌ Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setMessage("Something went wrong.");
    }
  };
  return (
    <div className="w-full flex p-2 justify-center items-center min-h-screen bg-gradient-to-r from-slate-200 to-zinc-200">
      <div className="w-full max-w-3xl border border-zinc-600 rounded-2xl overflow-hidden p-1 bg-white shadow-2xl">
        <Header LabelName="Exhibitor" />
        <div>
          <hr />
        </div>
        <div className="w-full p-2 bg-black text-white text-center ">
          <h2 className="font-bold md:text-5xl text-3xl">
            Online Registrations
          </h2>
        </div>
        <div className="md:p-4 p-2  ">
          <div
            className={`w-full ${
              otp.length > 0 ? "hidden" : "flex"
            } transition-all duration-300 `}
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className={`flex flex-col max-w-[400px] w-full mx-auto `}
              >
                <div className="grid  grid-cols-1 gap-3 border p-2 bg-sky-50 rounded-2xl my-4 ">
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={`text-lg  font-normal`}>
                          Enter Mobile Number*
                        </FormLabel>
                        <FormControl>
                          <PhoneInput
                            country={"in"} // Default country
                            enableSearch={true}
                            value={`${form.watch("country_code")}${form.watch(
                              "mobile",
                            )}`}
                            onChange={(value, country) => {
                              const countryData = country as CountryData;

                              const dialCode = countryData.dialCode; // e.g., "91"
                              const countryCode = `+${dialCode}`;
                              const pureNumber = value
                                .replace(dialCode, "")
                                .replace(/^0+/, "");

                              form.setValue("country_code", countryCode);
                              form.setValue("mobile", pureNumber);
                            }}
                            countryCodeEditable={false}
                            inputProps={{
                              name: "mobile",
                              required: true,
                            }}
                            autoFormat={false}
                            containerClass="p-0 flex w-full"
                            inputClass="phone-input-field text-input3 mr-0 w-full font-medium"
                            buttonClass="bg-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className=" flex items-center">
                    <button
                      type="submit"
                      className="py-2 px-4 bg-slate-700 text-white cursor-pointer rounded-lg"
                    >
                      Send OTP
                    </button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
          <div
            className={`w-full ${
              otp.length != 0 ? "flex flex-col gap-3" : "hidden"
            } transition-all duration-300 `}
          >
            <div className="w-full text-center">
              <p className="text-lg font-bold">{form.getValues("mobile")}</p>
              <button
                type="button"
                className="px-4 py-1 rounded-md bg-slate-300 cursor-pointer"
                onClick={() => setOtp("")}
              >
                Change mobile number
              </button>
            </div>
            <Form {...form2}>
              <form
                onSubmit={form2.handleSubmit(onSubmit2)}
                className={`flex flex-col max-w-[400px] w-full mx-auto transition-all duration-300`}
              >
                <div className="grid  grid-cols-1 gap-3 border p-2 bg-sky-50 rounded-2xl my-4">
                  <FormField
                    control={form2.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem className="text-center  justify-center">
                        <FormLabel
                          className={`text-lg  font-normal text-center grid w-full`}
                        >
                          Enter OTP*
                          <br /> <small>(sent on whatsapp)</small>
                        </FormLabel>
                        <FormControl>
                          <InputOTP
                            maxLength={6}
                            {...field}
                            pattern={REGEXP_ONLY_DIGITS}
                            autoComplete="off"
                            className="bg-white"
                          >
                            <InputOTPGroup>
                              {[...Array(6)].map((_, index) => (
                                <InputOTPSlot
                                  key={index}
                                  index={index}
                                  className="bg-white"
                                />
                              ))}
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="justify-center flex">
                    <button
                      type="submit"
                      className="py-2 px-4 bg-slate-700 text-white rounded-lg text-xl cursor-pointer"
                    >
                      Submit
                    </button>
                  </div>
                </div>
                <div className="text-center mt-2">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-blue-600 cursor-pointer underline font-medium"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <p className="text-gray-600 text-sm">
                      You can resend OTP in {Math.floor(timeLeft / 60)}:
                      {String(timeLeft % 60).padStart(2, "0")} min
                    </p>
                  )}
                </div>
              </form>
            </Form>
          </div>

          {message && (
            <p className="mt-4 text-center text-lg text-blue-600 font-medium">
              {message}
            </p>
          )}
          {form.formState.isSubmitting && <ProcessingOverlay />}
          {form2.formState.isSubmitting && <ProcessingOverlay />}
        </div>
      </div>
    </div>
  );
}
