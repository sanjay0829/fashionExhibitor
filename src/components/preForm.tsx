"use client";
import { PreData } from "@/models/predata";
import { AddSchema } from "@/schemas/addSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MdCategory, MdOutlineAttachEmail } from "react-icons/md";
import { PiMicrosoftExcelLogoDuotone } from "react-icons/pi";
import PhoneInput, { CountryData } from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { z } from "zod";
import { Button } from "./ui/button";

interface userProps {
  userId: string;
  closeModal: () => void;
  updateUsers: () => void;
}

type FormData = z.infer<typeof AddSchema>;

const PreForm: React.FC<userProps> = ({ userId, closeModal, updateUsers }) => {
  const [user, setUser] = useState<PreData>();

  const form = useForm<FormData>({
    resolver: zodResolver(AddSchema),
    defaultValues: {
      name: "",
      country_code: "+91",
      mobile: "",
      company: "",
      city: "",
    },
  });

  const getUserData = async () => {
    try {
      const response = await axios.get<ApiResponse>("/api/admin/predatauser", {
        params: { id: userId },
      });

      if (response.data.success) {
        setUser(response.data.predata);
        form.reset(response.data.predata);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message as string);
    }
  };

  useEffect(() => {
    if (userId) {
      getUserData();
    } else {
      closeModal();
    }
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      const response = await axios.patch<ApiResponse>(
        "/api/admin/predatauser?id=" + userId,
        data,
      );

      if (response.data.success) {
        toast.success("Data Updated Successfully");
        updateUsers();
        closeModal();
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message as string);
    }
  };

  return (
    <div className="max-w-screen-md w-full">
      <div className="w-full flex">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3 mx-2  max-w-2xl w-full"
          >
            <div className="grid md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={`text-lg font-medium `}>
                      Name*
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
                        }}
                        autoFormat={false}
                        containerClass="p-0 flex w-full"
                        inputClass="phone-input-field text-input3 mr-0 w-full font-medium"
                        dropdownStyle={{
                          top: "100%", // position it below input
                          bottom: "auto", // prevent flipping
                          zIndex: 9999, // ensure it’s above other elements
                        }}
                        buttonClass="bg-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={`text-lg font-medium `}>
                      Company
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
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={`text-lg font-medium `}>
                      City
                    </FormLabel>
                    <FormControl>
                      <input type="text" {...field} className="text-input3" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="p-1 border-t-2">
              <Button
                disabled={form.formState.isSubmitting}
                className={`px-10 py-1 text-lg font-bold rounded-3xl shadow shadow-gray-500 bg-gradient-to-tl from-fuchsia-800 to-pink-800 text-white hover:from-pink-700 hover:to-fuchsia-700 cursor-pointer ${
                  form.formState.isSubmitting ? "opacity-50" : ""
                }`}
              >
                {form.formState.isSubmitting ? "Processing..." : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default PreForm;
