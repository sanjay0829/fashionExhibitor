"use client";
import Header from "@/components/header";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RegisterSchema } from "@/schemas/registerSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import { country_arr, indian_states } from "@/helpers/country.js";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import type { CountryData } from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import ProcessingOverlay from "@/components/processing";
import { Dialog } from "@/components/ui/dialog";
import { Camera } from "lucide-react";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";
import { UpdateSellerSchema } from "@/schemas/updateSellerSchema";
import { User } from "@/models/user";
import { PreData } from "@/models/predata";

type FormData = z.infer<typeof RegisterSchema>;

const UpdatePage = () => {
  const [userData, setUserData] = useState<PreData>();
  const router = useRouter();

  const getUser = async () => {
    try {
      const response = await axios.get<ApiResponse>("/api/user/check");

      if (response.data.success) {
        setUserData(response.data.user);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message as string);
      router.push("/");
    }
  };

  const [regDates, setRegDates] = useState([
    "22nd July 2026",
    "23rd July 2026",
    "24th July 2026",
  ]);

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (userData) {
      form.reset({
        mobile: userData.mobile,
        country_code: userData.country_code,
        company: userData.company,
        name: userData.name,
        reg_category: "Exhibitor",
      });

      if ((userData.city || "").trim().toLowerCase() == "delhi") {
        setRegDates(["23rd July 2026", "24th July 2026"]);
      }
    }
  }, [userData]);

  const form = useForm<FormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      reg_category: "Exhibitor",
      mobile: "",
      country_code: "",
      company: "",
      attend_date: [],
    },
  });

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [openCamera, setOpenCamera] = useState(false);
  const [isFaceAligned, setIsFaceAligned] = useState(false);

  const capturePhoto = useCallback(() => {
    const video = webcamRef.current?.video as HTMLVideoElement;
    if (video) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL("image/jpeg", 1.0); // full quality
        setPhotoDataUrl(imageDataUrl);
        setOpenCamera(false);
        setIsFaceAligned(false);
      }
    }
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!photoDataUrl) {
      toast.error("Please capture a photo before submitting.");
      return;
    }
    try {
      const payload = { ...data, photoBase64: photoDataUrl };
      const response = await axios.post<ApiResponse>("/api/user", payload);
      if (response.data.success) {
        toast.success(response.data.message);
        router.push("/thanks");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message as string);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let model: blazeface.BlazeFaceModel;

    const detectFace = async () => {
      const video = webcamRef.current?.video as HTMLVideoElement;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (!video || !ctx) return;

      const predictions = await model.estimateFaces(video, false);
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      if (predictions.length > 0) {
        const face = predictions[0];
        const [x1, y1] = face.topLeft as [number, number];
        const [x2, y2] = face.bottomRight as [number, number];
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2;

        const circleCenterX = canvas!.width / 2;
        const circleCenterY = canvas!.height / 2;
        const radius = canvas!.width / 3;

        const isInside =
          Math.abs(cx - circleCenterX) < radius * 0.7 &&
          Math.abs(cy - circleCenterY) < radius * 0.7;

        setIsFaceAligned(isInside);
      } else {
        setIsFaceAligned(false);
      }
    };

    const loadModelAndStart = async () => {
      model = await blazeface.load();
      interval = setInterval(detectFace, 300);
    };

    if (openCamera) {
      tf.ready().then(loadModelAndStart);
    }

    return () => clearInterval(interval);
  }, [openCamera]);

  useEffect(() => {
    console.log(form.formState.errors);
  }, [form.formState.errors]);

  useEffect(() => {
    if (isFaceAligned) {
      setTimeout(() => {
        capturePhoto();
        setIsFaceAligned(false);
      }, 800);
    }
  }, [isFaceAligned]);

  return (
    <div className="w-full flex p-2 justify-center items-center min-h-screen bg-gradient-to-r from-slate-200 to-zinc-200">
      <div className="w-full max-w-3xl border border-zinc-600 rounded-2xl overflow-hidden p-1 bg-white shadow-2xl">
        <Header LabelName="Exhibitor" />
        <div>
          <hr />
        </div>
        <div className="py-4 md:px-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3 mx-auto max-w-xl"
            >
              <div className="grid grid-cols-1 gap-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`text-lg font-medium `}>
                        Full Name*(Owner)
                      </FormLabel>
                      <FormControl>
                        <input type="text" {...field} className="text-input3" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`text-lg font-medium `}>
                        Mobile*
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
                            readOnly: true,
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
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`text-lg font-medium `}>
                        Company*
                      </FormLabel>
                      <FormControl>
                        <input type="text" {...field} className="text-input3" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reg_category"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormLabel className={`text-lg font-medium `}>
                        Category*
                      </FormLabel>
                      <FormControl>
                        <select {...field} className="text-input3">
                          <option value="">Select</option>
                          <option>Buyer</option>
                          <option>Agent</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="attend_date"
                  render={() => {
                    const selectedDates = form.watch("attend_date") || [];

                    const handleCheckboxChange = (value: string) => {
                      const current = form.getValues("attend_date") || [];
                      if (current.includes(value)) {
                        form.setValue(
                          "attend_date",
                          current.filter((item) => item !== value),
                        );
                      } else {
                        form.setValue("attend_date", [...current, value]);
                      }
                    };

                    const isChecked = (value: string) =>
                      (form.watch("attend_date") || []).includes(value);

                    return (
                      <FormItem>
                        <FormLabel className="text-lg font-medium">
                          I will attend DFC’26 on*
                        </FormLabel>
                        <FormControl>
                          <div className="flex flex-col gap-2">
                            {regDates.map((date, idx) => (
                              <label
                                key={idx}
                                className="flex items-center gap-2 w-fit cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked(date)}
                                  onChange={() => handleCheckboxChange(date)}
                                  className="w-5 h-5"
                                />
                                {date}
                              </label>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <div className="space-y-2">
                  <FormLabel className="text-lg font-medium">
                    Photo/Selfie*
                  </FormLabel>
                  <Button
                    className="bg-zinc-500 cursor-pointer"
                    type="button"
                    onClick={() => setOpenCamera(true)}
                  >
                    <Camera /> {photoDataUrl ? "Retake Photo" : "Take a Selfie"}
                  </Button>

                  {photoDataUrl && (
                    <div className="p-3 flex flex-col items-center space-y-2 bg-slate-100">
                      <img
                        src={photoDataUrl}
                        alt="Preview"
                        className="w-40 h-40 rounded-full border-4 border-sky-500 "
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-1 border-t-2">
                <Button className="cursor-pointer text-lg font-bold ">
                  Submit
                </Button>
              </div>
            </form>
          </Form>
        </div>
        {form.formState.isSubmitting && <ProcessingOverlay />}
      </div>
      {/* Camera Modal */}
      {openCamera && (
        <Dialog open={openCamera} onOpenChange={setOpenCamera}>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded-lg w-[90%] max-w-md">
              <h2 className="text-xl font-bold mb-2">Take a Selfie</h2>
              <div
                className={`relative w-full aspect-square rounded-full overflow-hidden border-[20px]  mx-auto ${
                  isFaceAligned ? "border-green-500" : "border-red-500"
                }`}
              >
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user" }}
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                  width={480}
                  height={480}
                />
              </div>
              <div className="w-full">
                <p
                  className={`text-lg font-bold text-center ${
                    isFaceAligned ? "text-green-700" : "text-red-600"
                  } `}
                >
                  {" "}
                  {isFaceAligned
                    ? "Take photo"
                    : "Please place your face inside circle"}
                </p>
              </div>
              <div className="mt-4 flex justify-between">
                <Button
                  type="button"
                  onClick={() => setOpenCamera(false)}
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={capturePhoto}
                  disabled={!isFaceAligned}
                  className="bg-green-500 disabled:bg-gray-500 hidden"
                >
                  Capture Photo
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default UpdatePage;
