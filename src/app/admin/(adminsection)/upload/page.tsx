"use client";
import ProcessingOverlay from "@/components/processing";
import Titlebar from "@/components/titlebar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { exportToExcel } from "@/helpers/exportToexcel";
import { PreData } from "@/models/predata";
import { AddSchema } from "@/schemas/addSchema";
import { RegisterSchema } from "@/schemas/registerSchema";
import { UploadSchema } from "@/schemas/uploadSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaSearch } from "react-icons/fa";
import { MdCategory, MdOutlineAttachEmail } from "react-icons/md";
import { PiMicrosoftExcelLogoDuotone } from "react-icons/pi";
import PhoneInput, { CountryData } from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { z } from "zod";

type FormData2 = z.infer<typeof AddSchema>;

type FormData1 = z.infer<typeof UploadSchema>;

const UploadPage = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData1>({
    resolver: zodResolver(UploadSchema),
  });

  const form = useForm<FormData2>({
    resolver: zodResolver(AddSchema),
    defaultValues: {
      name: "",
      country_code: "+91",
      mobile: "",
      company: "",
      city: "",
    },
  });

  const onSubmit = async (data: FormData1) => {
    try {
      const formData = new FormData();
      formData.append("excel_file", data.upload_excel_file[0]);

      const response = await axios.post("/api/admin/uploaddata", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "arraybuffer", // Important for receiving Excel file
      });

      // Check response content type
      const contentType = response.headers["content-type"];

      if (contentType.includes("application/json")) {
        // Handle JSON response (no duplicates)
        const jsonResponse = JSON.parse(
          new TextDecoder().decode(response.data),
        );
        toast.success(jsonResponse.message || "Data uploaded successfully");
      } else if (
        contentType.includes(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
      ) {
        // Handle Excel response (with duplicates)
        const insertedCount = response.headers["x-inserted-count"] || 0;
        const duplicateCount = response.headers["x-duplicate-count"] || 0;

        toast.success(
          `Inserted ${insertedCount} records. Found ${duplicateCount} duplicates. Downloading duplicates file...`,
        );

        // Create and trigger download
        const blob = new Blob([response.data], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "duplicates.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        toast.error("Unexpected response format");
      }

      reset();
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      if (axiosError.response?.data?.message) {
        toast.error(axiosError.response.data.message);
      } else {
        toast.error("An error occurred while uploading the file");
      }
    }
  };

  const OnSubmit2 = async (data: FormData2) => {
    try {
      const response = await axios.post<ApiResponse>(
        "/api/admin/addpreuser",
        data,
      );

      if (response.data.success) {
        toast.success("Data Added Successfully");
        form.reset();
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message as string);
    }
  };
  useEffect(() => {
    console.log(form.formState.errors);
  }, [form.formState.errors]);

  const [users, setUsers] = useState<PreData[] | undefined>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [searchString, setSearchString] = useState<string | undefined>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const resultsPerPage = 50;

  const handleSubmit2 = async () => {
    try {
      setIsSaving(true);
      const response = await axios.get("/api/admin/predata", {
        params: {
          search: searchString,
          page: currentPage,
          limit: resultsPerPage,
        },
      });
      if (response.data.success) {
        setUsers(response.data.userList);
        setTotalPages(
          Math.ceil((response.data.totalCount || 0) / resultsPerPage),
        );
        if (response.data.userList?.length === 0) {
          toast.error("No data to display for given search query");
        }
      }
      setIsSaving(false);
      console.log(response);
    } catch (error) {
      console.log(error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data?.message as string);
      setIsSaving(false);
    }
  };

  useEffect(() => {
    handleSubmit2();
  }, [currentPage]);
  useEffect(() => {
    handleSubmit2();
  }, []);

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-gradient-to-l from-slate-50 to-sky-50">
      <Titlebar LabelName="Upload Mobile Nos." />
      <div className="w-full grid md:grid-cols-2 grid-cols-1 gap-2">
        <div className="w-full max-w-6xl bg-gradient-to-br from-gray-100-400 overflow-hidden rounded-2xl border to-zinc-200 shadow shadow-sky-400">
          <div className="bg-sky-900 p-3 text-white">
            <h2 className="text-2xl font-bold">Bulk Upload</h2>
          </div>
          <div className="w-full flex">
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
              <div className="max-w-3xl w-full my-2  rounded-xl">
                <div className="flex w-full flex-col gap-2 px-3 py-1">
                  <label htmlFor="searchText" className="text-2xl font-bold">
                    Upload Excel File of Data
                  </label>
                  <div className="flex flex-col gap-1 max-w-[400px]">
                    <input
                      id="searchText"
                      type="file"
                      accept=".xlsx, .xls"
                      {...register("upload_excel_file", {
                        required: "File is required.",
                      })}
                      className="bg-white focus:border-none focus:outline-0 w-full rounded-lg p-1 text-lg text-center"
                    />
                    {errors.upload_excel_file && (
                      <p className="text-red-700 text-[0.8rem]">
                        {errors.upload_excel_file.message as string}
                      </p>
                    )}
                  </div>
                  <div className="flex w-full gap-2 mt-3 justify-between">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-10 py-1 text-lg font-bold rounded-3xl shadow shadow-gray-500 bg-gradient-to-tl from-fuchsia-800 to-pink-800 text-white hover:from-pink-700 hover:to-fuchsia-700 cursor-pointer ${
                        isSubmitting ? "opacity-50" : ""
                      }`}
                    >
                      {isSubmitting ? "Processing..." : "Submit"}
                    </button>
                    <a
                      href="/SampleFormat.xlsx"
                      download={true}
                      className="text-sky-500 underline cursor-pointer"
                    >
                      Download Sample
                    </a>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="w-full max-w-6xl bg-gradient-to-br from-gray-100-400  rounded-2xl border to-zinc-200 shadow shadow-sky-400">
          <div className="bg-sky-900 p-3 text-white rounded-t-2xl">
            <h2 className="text-2xl font-bold">Single Addition</h2>
          </div>
          <div className="w-full flex">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(OnSubmit2)}
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
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={`text-lg font-medium `}>
                          City
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
      </div>
      <div className="w-full md:p-10 p-3 md:pt-2">
        <div className="flex w-full items-center bg-slate-300 p-1">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit2();
            }}
            className="flex flex-wrap w-full gap-1  md:flex-nowrap"
          >
            <div className="relative border md:max-w-[350px] rounded-lg flex items-center focus-within:shadow-md focus-within:shadow-gray-300  focus-within:outline-2 focus-within:outline-gray-500 bg-white md:w-[98%] w-[95%]  p-1">
              <FaSearch className="absolute right-4 text-orange-500" />
              <input
                type="text"
                placeholder="Name/mobile"
                className="text-input2"
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="text-center mx-2 my-2 md:my-0 disabled:opacity-70 disabled:pointer-events-none hover:scale-105 transition-all duration-500 bg-gray-800 hover:bg-gray-900 w-fit py-1 rounded-lg text-white px-5 min-w-[200px] text-lg"
            >
              Submit
            </button>
          </form>
        </div>
        {/* <div className="flex justify-start">
          {users && users.length > 0 && (
            <button className="px-4 py-1 flex items-center bg-zinc-600 text-white hover:bg-zinc-700 rounded-sm shadow-lg">
              <PiMicrosoftExcelLogoDuotone /> Download as Excel
            </button>
          )}
        </div> */}
        <div className="w-full max-w-screen-xl mt-2 mx-auto">
          {users && users?.length > 0 && (
            <div className="w-full overflow-auto">
              <table className=" border-collapse w-full">
                <thead>
                  <tr className="bg-black text-white ">
                    <th className="text-left font-bold border px-2">S.No</th>

                    <th className="text-left  font-bold border  px-2">Name</th>
                    <th className="text-left  font-bold border  px-2">
                      Mobile
                    </th>
                    <th className="text-left  font-bold border  px-2">
                      Company
                    </th>
                    <th className="text-left  font-bold border  px-2">City</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={user._id as string}
                      className="hover:bg-gray-100 odd:bg-sky-100"
                    >
                      <td className="border px-2 text-sm py-2">
                        {(currentPage - 1) * resultsPerPage + index + 1}.
                      </td>
                      <td className="border px-2 text-sm py-2">{user.name}</td>

                      <td className="border px-2 text-sm py-2">
                        {user.country_code}
                        {"-"}
                        {user.mobile}
                      </td>
                      <td className="border px-2 text-sm py-2">
                        {user.company}
                      </td>
                      <td className="border px-2 text-sm py-2">{user.city}</td>
                      <td className="border px-2 text-sm py-2 hidden">
                        <button
                          onClick={async () => {
                            setIsSaving(true);

                            const result = await axios.post<ApiResponse>(
                              "/api/user/sendmsg",
                              { id: user._id },
                            );
                            if (result.data.success) {
                              toast.success(
                                `Confirmation  sent on ${user.mobile}`,
                              );
                              setIsSaving(false);
                            }
                          }}
                          className="bg-sky-700 flex gap-2 items-center hover:bg-zinc-900 text-white px-4 py-2 rounded-md"
                        >
                          <MdOutlineAttachEmail />
                          Send
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-1 flex-wrap text-sm">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Prev
          </button>

          {(() => {
            const pageButtons = [];
            const blockSize = 10;
            const currentBlock = Math.floor((currentPage - 1) / blockSize);
            const startPage = currentBlock * blockSize + 1;
            const endPage = Math.min(startPage + blockSize - 1, totalPages);

            // Show "1 ..." at the beginning if not on first block
            if (currentBlock > 0) {
              pageButtons.push(
                <button
                  key="first"
                  onClick={() => setCurrentPage(1)}
                  className="px-3 py-1 rounded bg-gray-300"
                >
                  1
                </button>,
              );
              pageButtons.push(
                <span key="dots-start" className="px-2">
                  ...
                </span>,
              );
            }

            for (let page = startPage; page <= endPage; page++) {
              pageButtons.push(
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300"
                  }`}
                >
                  {page}
                </button>,
              );
            }

            // Show "... lastPage" at the end if not in last block
            if (endPage < totalPages) {
              pageButtons.push(
                <span key="dots-end" className="px-2">
                  ...
                </span>,
              );
              pageButtons.push(
                <button
                  key={totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300"
                  }`}
                >
                  {totalPages}
                </button>,
              );
            }

            return pageButtons;
          })()}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {isSubmitting && <ProcessingOverlay />}
      {isSaving && <ProcessingOverlay />}
    </div>
  );
};

export default UploadPage;
