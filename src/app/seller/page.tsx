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
import { IoPersonAddSharp } from "react-icons/io5";
import { country_arr, indian_states } from "@/helpers/country.js";
import { useFieldArray, useForm } from "react-hook-form";
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
import { SellerSchema } from "@/schemas/sellerSchema";
import { AnimatePresence, motion } from "framer-motion";
import { MdDeleteForever } from "react-icons/md";
import { CSSTransition, TransitionGroup } from "react-transition-group";

type FormData = z.infer<typeof SellerSchema>;

const SellerPage = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(SellerSchema),
    defaultValues: {
      name: "",
      reg_category: "Seller",
      country: "",
      email: "",
      mobile: "",
      country_code: "",
      company: "",
      city: "",
      state: "",
      seller_partner: [],
      seller_team: [],
    },
  });

  const country = form.watch("country");
  const router = useRouter();

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
      }
    }
  }, []);

  const { control } = form;
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "seller_partner",
  });

  const {
    fields: teamFields,
    append: appendTeam,
    remove: removeTeam,
    replace: replaceTeam,
  } = useFieldArray({
    control,
    name: "seller_team",
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const MAX_FAMILY_MEMBERS = 10;

  // For partners
  const handleAddFamilyMember = useCallback(() => {
    if (isAnimating) return;

    if (fields.length >= MAX_FAMILY_MEMBERS) {
      toast.error(`Maximum of ${MAX_FAMILY_MEMBERS} family members allowed`);
      return;
    }

    setIsAnimating(true);
    append(
      {
        partner_name: "",
        partner_country_code: "",
        partner_mobile: "",
      },
      { shouldFocus: false }
    ); // Disable auto-focus to prevent animation issues
    setTimeout(() => setIsAnimating(false), 300); // Match animation duration
  }, [fields.length, isAnimating, append]);

  // For team members
  const handleAddTeamMember = useCallback(() => {
    if (isAnimating) return;

    if (teamFields.length >= MAX_FAMILY_MEMBERS) {
      toast.error(`Maximum of ${MAX_FAMILY_MEMBERS} team members allowed`);
      return;
    }

    setIsAnimating(true);
    appendTeam(
      {
        team_name: "",
        team_country_code: "",
        team_mobile: "",
      },
      { shouldFocus: false }
    );
    setTimeout(() => setIsAnimating(false), 300);
  }, [teamFields.length, isAnimating, appendTeam]);

  // For partners
  const handleRemoveFamilyMember = useCallback(
    (index: number) => {
      if (isAnimating) return;

      setIsAnimating(true);
      remove(index);
      setTimeout(() => setIsAnimating(false), 300);
    },
    [isAnimating, remove]
  );

  // For team members
  const handleRemoveFTeamMember = useCallback(
    (index: number) => {
      if (isAnimating) return;

      setIsAnimating(true);
      removeTeam(index);
      setTimeout(() => setIsAnimating(false), 300);
    },
    [isAnimating, removeTeam]
  );

  const onSubmit = async (data: FormData) => {
    if (!photoDataUrl) {
      toast.error("Please capture a photo before submitting.");
      return;
    }

    const allMobiles = [
      `${data.country_code}${data.mobile}`,
      ...(data.seller_partner ?? []).map(
        (p) => `${p.partner_country_code}${p.partner_mobile}`
      ),
      ...(data.seller_team ?? []).map(
        (t) => `${t.team_country_code}${t.team_mobile}`
      ),
    ];

    const duplicates = allMobiles.filter(
      (item, index) => allMobiles.indexOf(item) !== index
    );

    if (duplicates.length > 0) {
      toast.error(
        `Duplicate mobile number(s) in form: ${[...new Set(duplicates)].join(
          ", "
        )}`
      );
      return;
    }

    try {
      const payload = { ...data, photoBase64: photoDataUrl };
      // const response = await axios.post<ApiResponse>(
      //   "/api/user/seller",
      //   payload
      // );
      // if (response.data.success) {
      //   toast.success(response.data.message);
      //   router.push("/thanks");
      // }
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

  return (
    <div className="w-full flex p-2 justify-center items-center min-h-screen bg-gradient-to-r from-slate-200 to-zinc-200">
      <div className="w-full max-w-3xl border border-zinc-600 rounded-2xl overflow-hidden p-1 bg-white shadow-2xl">
        <Header LabelName="SELLER" />
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`text-lg font-medium `}>
                        Email*
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
                            "mobile"
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
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`text-lg font-medium `}>
                        Country*
                      </FormLabel>
                      <FormControl>
                        <select {...field} className="text-input3">
                          <option value="">Select</option>
                          {country_arr.map((item, index) => (
                            <option key={index}>{item}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`text-lg font-medium `}>
                        State*
                      </FormLabel>
                      <FormControl>
                        {country == "India" ? (
                          <select {...field} className="text-input3">
                            <option value="">Select</option>
                            {indian_states.map((item, index) => (
                              <option key={index}>{item}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            {...field}
                            className="text-input3"
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`text-lg font-medium `}>
                        City*
                      </FormLabel>
                      <FormControl>
                        <input type="text" {...field} className="text-input3" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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

                <div className="space-y-2">
                  <div className=" pt-3 rounded-lg w-full mt-2">
                    <h2 className="text-lg  font-medium ">
                      Add Seller Partner
                    </h2>
                  </div>
                  <div className="grid md:grid-cols-2 grid-cols-1 gap-3 mb-4">
                    <Button
                      type="button"
                      onClick={handleAddFamilyMember}
                      disabled={
                        fields.length >= MAX_FAMILY_MEMBERS || isAnimating
                      }
                      className="w-fit bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <IoPersonAddSharp /> Add
                    </Button>
                  </div>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="bg-gray-50">
                    <div className="flex justify-between items-center px-3 border-b-2 mb-1 bg-sky-200">
                      <h2 className="text-lg font-semibold">
                        Partner {index + 1} details
                      </h2>
                      <Button
                        type="button"
                        onClick={() => handleRemoveFamilyMember(index)}
                        variant="destructive"
                        disabled={isAnimating}
                        size="sm"
                        className="cursor-pointer"
                      >
                        <MdDeleteForever />
                      </Button>
                    </div>
                    <div className="w-full gap-1 grid md:grid-col-2 grid-cols-1 px-2 pb-2">
                      {/* Keep the existing form fields for each member */}
                      <FormField
                        control={form.control}
                        name={`seller_partner.${index}.partner_name` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg font-semibold text-black">
                              Name*
                            </FormLabel>
                            <FormControl>
                              <input
                                type="text"
                                {...field}
                                className="text-input3"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`seller_partner.${index}.partner_mobile` as const}
                        render={({ field }) => {
                          const partnerCodePath =
                            `seller_partner.${index}.partner_country_code` as const;
                          const partnerMobilePath =
                            `seller_partner.${index}.partner_mobile` as const;

                          return (
                            <FormItem>
                              <FormLabel className="text-lg font-medium">
                                Mobile*
                              </FormLabel>
                              <FormControl>
                                <PhoneInput
                                  country={"in"}
                                  enableSearch={true}
                                  value={`${form.watch(
                                    partnerCodePath
                                  )}${form.watch(partnerMobilePath)}`}
                                  onChange={(value, country) => {
                                    const countryData = country as CountryData;
                                    const dialCode = countryData.dialCode;
                                    const countryCode = `+${dialCode}`;
                                    const pureNumber = value
                                      .replace(dialCode, "")
                                      .replace(/^0+/, "");

                                    form.setValue(partnerCodePath, countryCode);
                                    form.setValue(
                                      partnerMobilePath,
                                      pureNumber
                                    );
                                  }}
                                  countryCodeEditable={false}
                                  inputProps={{
                                    name: `seller_partner.${index}.partner_mobile`,
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
                          );
                        }}
                      />

                      {/* Keep other form fields for age and gender */}
                    </div>
                  </div>
                ))}

                <div className="space-y-2">
                  <div className=" pt-3 rounded-lg w-full mt-2">
                    <h2 className="text-lg  font-medium ">Add Team Members</h2>
                  </div>
                  <div className="grid md:grid-cols-2 grid-cols-1 gap-3 mb-4">
                    <Button
                      type="button"
                      onClick={handleAddTeamMember}
                      disabled={
                        fields.length >= MAX_FAMILY_MEMBERS || isAnimating
                      }
                      className="w-fit bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <IoPersonAddSharp /> Add
                    </Button>
                  </div>
                </div>

                {teamFields.map((field, index) => (
                  <div key={field.id} className="bg-gray-50">
                    <div className="flex justify-between items-center px-3 border-b-2 mb-1 bg-sky-200">
                      <h2 className="text-lg font-semibold">
                        Team member {index + 1} details
                      </h2>
                      <Button
                        type="button"
                        onClick={() => handleRemoveFTeamMember(index)}
                        variant="destructive"
                        disabled={isAnimating}
                        size="sm"
                        className="cursor-pointer"
                      >
                        <MdDeleteForever />
                      </Button>
                    </div>
                    <div className="w-full gap-1 grid md:grid-col-2 grid-cols-1 px-2 pb-2">
                      {/* Keep the existing form fields for each member */}
                      <FormField
                        control={form.control}
                        name={`seller_team.${index}.team_name` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg font-semibold text-black">
                              Name*
                            </FormLabel>
                            <FormControl>
                              <input
                                type="text"
                                {...field}
                                className="text-input3"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`seller_team.${index}.team_mobile` as const}
                        render={({ field }) => {
                          const teamCodePath =
                            `seller_team.${index}.team_country_code` as const;
                          const teamMobilePath =
                            `seller_team.${index}.team_mobile` as const;

                          return (
                            <FormItem>
                              <FormLabel className="text-lg font-medium">
                                Mobile*
                              </FormLabel>
                              <FormControl>
                                <PhoneInput
                                  country={"in"}
                                  enableSearch={true}
                                  value={`${form.watch(
                                    teamCodePath
                                  )}${form.watch(teamMobilePath)}`}
                                  onChange={(value, country) => {
                                    const countryData = country as CountryData;
                                    const dialCode = countryData.dialCode;
                                    const countryCode = `+${dialCode}`;
                                    const pureNumber = value
                                      .replace(dialCode, "")
                                      .replace(/^0+/, "");

                                    form.setValue(teamCodePath, countryCode);
                                    form.setValue(teamMobilePath, pureNumber);
                                  }}
                                  countryCodeEditable={false}
                                  inputProps={{
                                    name: `seller_team.${index}.team_mobile`,
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
                          );
                        }}
                      />

                      {/* Keep other form fields for age and gender */}
                    </div>
                  </div>
                ))}
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
                className={`relative w-full aspect-square rounded-full overflow-hidden border-4  mx-auto ${
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
                <p className="text-sm text-center text-sky-400">
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

export default SellerPage;
