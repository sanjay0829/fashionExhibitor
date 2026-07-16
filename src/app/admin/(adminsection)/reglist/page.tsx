"use client";
import Dateformat from "@/components/date";

import { User } from "@/models/user";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaRegEdit, FaSearch } from "react-icons/fa";
import { MdCategory, MdOutlineAttachEmail } from "react-icons/md";
import { PiMicrosoftExcelLogoDuotone } from "react-icons/pi";
import { RiSecurePaymentFill } from "react-icons/ri";

import { SendConfiramtionEmail } from "@/helpers/sendConfirmationEmail";
import ProcessingOverlay from "@/components/processing";
import { exportToExcel } from "@/helpers/exportToexcel";
import { SendWhatApp } from "@/helpers/sendWhatsApp";
import Titlebar from "@/components/titlebar";

const formatDate = (dateString: Date) => {
  if (!dateString) return ""; // Handle empty dates
  const date = new Date(dateString);

  const day = date.getDate().toString().padStart(2, "0"); // Ensure two-digit day
  const month = date.toLocaleString("en-GB", { month: "short" }); // Get short month
  const year = date.getFullYear();
  const hour = date.getHours();
  const minute = date.getMinutes();

  return `${day}-${month}-${year} ${hour}:${minute}`;
};

const RegList = () => {
  const [searchString, setSearchString] = useState<string | undefined>("");
  const [category, setCategory] = useState<string | undefined>("");
  const [payment, setPayment] = useState<string | undefined>("");

  const [users, setUsers] = useState<User[] | undefined>([]);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      const response = await axios.get<ApiResponse>("/api/admin/reports", {
        params: {
          search: searchString,
          category: category,
          payment_status: payment,
        },
      });
      if (response.data.success) {
        setUsers(response.data.userList);
        if (response.data.userList?.length == 0) {
          toast.error("No data to diaplay for given search query");
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
    handleSubmit();
  }, []);

  return (
    <div className="max-w-screen-2xl w-full">
      <Titlebar LabelName="Registrations" />
      <div className="w-full md:p-10 p-3 md:pt-2">
        <div className="flex w-full items-center bg-slate-300 p-1">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex flex-wrap w-full gap-1  md:flex-nowrap"
          >
            <div className="relative border md:max-w-[350px] rounded-lg flex items-center focus-within:shadow-md focus-within:shadow-gray-300  focus-within:outline-2 focus-within:outline-gray-500 bg-white md:w-[98%] w-[95%]  p-1">
              <FaSearch className="absolute right-4 text-orange-500" />
              <input
                type="text"
                placeholder="Name/Reg no./mobile"
                className="text-input2"
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
              />
            </div>
            <div className="relative border md:max-w-[350px] rounded-lg flex items-center focus-within:shadow-md focus-within:shadow-gray-300  focus-within:outline-2 focus-within:outline-gray-500 bg-white md:w-[98%] w-[95%]  p-1">
              <MdCategory className="absolute right-4 text-orange-500" />
              <select
                className="text-input2 bg-none appearance-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Category Filter</option>
                <option>Buyer</option>
                <option>Agent</option>
              </select>
            </div>

            <button
              type="submit"
              className="text-center mx-2 my-2 md:my-0 disabled:opacity-70 disabled:pointer-events-none hover:scale-105 transition-all duration-500 bg-gray-800 hover:bg-gray-900 w-fit py-1 rounded-lg text-white px-5 min-w-[200px] text-lg"
            >
              Submit
            </button>
          </form>
        </div>
        <div className="flex justify-start">
          {users && users.length > 0 && (
            <button
              onClick={() => exportToExcel(users, "UserData.xlsx")}
              className="px-4 py-1 flex items-center bg-zinc-600 text-white hover:bg-zinc-700 rounded-sm shadow-lg"
            >
              <PiMicrosoftExcelLogoDuotone /> Download as Excel
            </button>
          )}
        </div>
        <div className="w-full max-w-screen-xl mt-2 mx-auto">
          {users && users?.length > 0 && (
            <div className="w-full overflow-auto">
              <table className=" border-collapse w-full">
                <thead>
                  <tr className="bg-black text-white ">
                    <th className="text-left font-bold border px-2">S.No</th>
                    <th className="text-left font-bold border px-2">Reg no</th>
                    <th className="text-left  font-bold border  px-2">Name</th>
                    <th className="text-left  font-bold border  px-2">
                      Mobile
                    </th>
                    <th className="text-left  font-bold border  px-2">
                      Company
                    </th>
                    <th className="text-left  font-bold border  px-2">
                      Category
                    </th>

                    <th className="text-left  font-bold border px-2">
                      Reg Date
                    </th>
                    <th className="text-left  font-bold border px-2">
                      Confirmation
                    </th>
                    <th className="text-left  font-bold border px-2 hidden">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={user._id as string}
                      className="hover:bg-gray-100 odd:bg-sky-100"
                    >
                      <td className="border px-2 text-sm py-2">{index + 1}.</td>
                      <td className="border px-2 text-sm py-2">
                        {user.reg_no}
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
                      <td className="border px-2 text-sm py-2">
                        {user.reg_category}
                      </td>

                      <td className="border px-2 text-sm py-2">
                        {user?.createdAt && (
                          <Dateformat datestring={user.createdAt.toString()} />
                        )}
                      </td>
                      <td className="border px-2 text-sm py-2">
                        <button
                          onClick={async () => {
                            setIsSaving(true);

                            const result = await axios.post<ApiResponse>(
                              "/api/user/sendmsg",
                              { id: user._id }
                            );
                            if (result.data.success) {
                              toast.success(
                                `Confirmation  sent on ${user.mobile}`
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
                      <td className="border px-2 text-sm py-2 hidden">
                        <button
                          onClick={() => {
                            router.replace(`/admin/edit/${user._id}`);
                          }}
                          className="bg-zinc-800 flex items-center hover:bg-zinc-900 text-white px-4 py-2 rounded-md"
                        >
                          <FaRegEdit />
                          Edit
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
      {isSaving && <ProcessingOverlay />}
    </div>
  );
};

export default RegList;
