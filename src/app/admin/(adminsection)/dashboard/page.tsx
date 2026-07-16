"use client";
import Linechart from "@/components/linechart";
import Titlebar from "@/components/titlebar";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CountUp from "react-countup";

interface Counts {
  TOTAL_REG: number;
}

const page = () => {
  const [countData, setCountData] = useState<Counts>({
    TOTAL_REG: 0,
  });

  const getDataCounts = async () => {
    try {
      const response = await axios.get(
        "/api/admin/dashboardreports?calltype=counts"
      );
      if (response.data.success) {
        setCountData(response.data.countdata[0]);

        console.log(response.data.countdata);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message as string);
    }
  };

  useEffect(() => {
    getDataCounts();
  }, []);

  return (
    <div className="w-full max-w-screen">
      <Titlebar />
      <div className="w-full md:p-10 p-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-zinc-400 p-1">
            <div className="rounded-2xl border-2 bg-zinc-900 space-y-3 p-5 text-white max-w-72">
              <h2 className="font-bold text-3xl border-b border-white pb-2">
                Total Reg.
              </h2>

              <p className="font-semibold text-3xl">
                <CountUp start={0} end={countData.TOTAL_REG} duration={0.5} />
              </p>
            </div>
          </div>
          <div className="px-6 border border-gray-700 mx-1">
            <h2 className="text-center font-semibold text-xl">
              Last 7 days registrations
            </h2>
            <Linechart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
