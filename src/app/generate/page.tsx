"use client";
import { generateAndUploadAllUsers } from "@/helpers/generateBulkQr";
import React from "react";
import toast from "react-hot-toast";

const page = () => {
  const create = async () => {
    try {
      const response = await generateAndUploadAllUsers();
      toast.success(response.message);
    } catch (error) {
      console.log(error);
      toast.error("Something Wrong");
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-sky-300 to-amber-300 flex justify-center items-center">
      <button
        className="px-6 py-2 bg-black rounded-2xl text-lg text-white"
        onClick={() => create()}
      >
        Create Bulk
      </button>
    </div>
  );
};

export default page;
