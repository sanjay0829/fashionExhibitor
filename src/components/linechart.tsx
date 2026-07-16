"use client";
import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { ApiResponse } from "@/types/ApiResponse";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface dailyRegData {
  reg_date: string;
  regcount: number;
}

const Linechart = () => {
  const [chartData, setChartData] = useState<dailyRegData[]>([]);
  const [lData, setlData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getData = async () => {
    try {
      const response = await axios.get(
        "/api/admin/dashboardreports?calltype=last7days"
      );
      console.log(response);

      if (response.data.success) {
        setChartData(response.data.last7days);
        console.log(response.data.last7days);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message as string);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (!chartData || chartData.length == 0) {
      return;
    }
    if (chartData) {
      setIsLoading(false);
      const labels = chartData.map((item) => item.reg_date);
      const dailydata = chartData.map((item) => item.regcount || 0);

      setlData({
        labels,
        datasets: [
          {
            label: "Reg Count",
            data: dailydata,
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            tension: 0.5,
          },
        ],
      });
    }
  }, [chartData]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: false, // ✅ Enable title
        text: "Orders Payment Status", // ✅ Set your desired title
      },
    },
  };

  if (isLoading) return <p>Loading chart...</p>;
  return <Line options={options} data={lData} />;
};

export default Linechart;
