"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { TbArrowBigRightLines, TbSettings } from "react-icons/tb";
import {
  MdAdminPanelSettings,
  MdLogout,
  MdOutlineDashboard,
} from "react-icons/md";
import { FaClipboardList } from "react-icons/fa6";
import { GrWorkshop } from "react-icons/gr";
import { RiApps2AiFill } from "react-icons/ri";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const Sidebar = () => {
  const [expanded, setExpanded] = useState(false);
  const [usertype, setUsertype] = useState("master");

  const router = useRouter();

  const logout = async () => {
    try {
      const response = await axios.get<ApiResponse>("/api/admin/auth");

      if (response.data.success) {
        toast.success("Logged out successfully");
        router.push("/admin");
      }
    } catch (error) {
      console.log(error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message as string);
    }
  };
  return (
    <div className="border-r min-h-screen flex shadow-lg shadow-slate-300 z-30 sticky top-0">
      <nav className="min-h-screen bg-gray-800 text-white">
        <div className="flex flex-col ">
          <div className="flex relative p-3 justify-center items-center bg-slate-100">
            <img
              src={"/img/logo.png"}
              alt=""
              className={`mx-1 ${expanded ? "w-full max-w-36" : "w-12"} `}
            />

            {expanded ? (
              <TbArrowBigRightLines
                size={20}
                className="absolute right-2 text-white bottom-[-20px] cursor-pointer transform rotate-180 transition-all duration-200"
                onClick={() => {
                  setExpanded(!expanded);
                }}
              />
            ) : (
              <TbArrowBigRightLines
                size={20}
                className="absolute right-2 text-white bottom-[-20px] cursor-pointer transform rotate-0 transition-all duration-200"
                onClick={() => {
                  setExpanded(!expanded);
                }}
              />
            )}
          </div>
          <hr />
          <ul className="mt-6 space-y-4 ">
            <li className="flex group relative items-center">
              <Link
                href="/admin/dashboard"
                className={`flex items-center px-3 gap-4 hover:translate-x-2 transition-all duration-100 ${
                  expanded && "  hover:bg-slate-50 hover:text-black"
                }`}
              >
                <MdOutlineDashboard size={24} />
                <span
                  className={`text-nowrap py-2  overflow-hidden transition-all duration-200 ${
                    expanded ? " w-36 " : " w-0  "
                  }`}
                >
                  Overview
                </span>
                {!expanded && (
                  <span
                    className="absolute opacity-0  invisible group-hover:visible duration-500 group-hover:opacity-100 left-16 top-3
                     bg-sky-400 text-black font-semibold rounded-md px-3"
                  >
                    Overview
                  </span>
                )}
              </Link>
            </li>
            <li className="flex group relative items-center">
              <Link
                href="/admin/reglist"
                className={`flex items-center px-3 gap-4 hover:translate-x-2 transition-all duration-100 ${
                  expanded && "  hover:bg-slate-50 hover:text-black"
                }`}
              >
                <FaClipboardList size={24} />
                <span
                  className={`text-nowrap py-2  overflow-hidden transition-all duration-200 ${
                    expanded ? " w-36 " : " w-0  "
                  }`}
                >
                  Reg Report
                </span>
                {!expanded && (
                  <span
                    className="absolute text-nowrap opacity-0  invisible group-hover:visible duration-500 group-hover:opacity-100 left-16 top-3
                     bg-sky-400 text-black font-semibold rounded-md px-3"
                  >
                    Reg. Report
                  </span>
                )}
              </Link>
            </li>
            {usertype == "master2" && (
              <>
                <li className=" group relative items-center hidden">
                  <Link
                    href="/admin/workshop"
                    className={`flex items-center px-3 gap-4 hover:translate-x-2 transition-all duration-100 ${
                      expanded && "  hover:bg-slate-50 hover:text-black"
                    }`}
                  >
                    <GrWorkshop size={24} />
                    <span
                      className={`text-nowrap py-2  overflow-hidden transition-all duration-200 ${
                        expanded ? " w-36 " : " w-0  "
                      }`}
                    >
                      Workshops
                    </span>
                    {!expanded && (
                      <span
                        className="absolute opacity-0 text-nowrap  invisible group-hover:visible duration-500 group-hover:opacity-100 left-16 top-3
                     bg-sky-400 text-black font-semibold rounded-md px-3"
                      >
                        Workshops
                      </span>
                    )}
                  </Link>
                </li>
                <li className="flex group relative items-center">
                  <Link
                    href="/admin/category"
                    className={`flex items-center px-3 gap-4 hover:translate-x-2 transition-all duration-100 ${
                      expanded && "  hover:bg-slate-50 hover:text-black"
                    }`}
                  >
                    <RiApps2AiFill size={24} />
                    <span
                      className={`text-nowrap py-2  overflow-hidden transition-all duration-200 ${
                        expanded ? " w-36 " : " w-0  "
                      }`}
                    >
                      Reg. Category
                    </span>
                    {!expanded && (
                      <span
                        className="absolute opacity-0 text-nowrap  invisible group-hover:visible duration-500 group-hover:opacity-100 left-16 top-3
                     bg-sky-400 text-black font-semibold rounded-md px-3"
                      >
                        Reg. Category
                      </span>
                    )}
                  </Link>
                </li>
                <li className=" group relative items-center ">
                  <Link
                    href="/admin/adminusers"
                    className={`flex items-center px-3 gap-4 hover:translate-x-2 transition-all duration-100 ${
                      expanded && "  hover:bg-slate-50 hover:text-black"
                    }`}
                  >
                    <MdAdminPanelSettings size={24} />

                    <span
                      className={`text-nowrap py-2  overflow-hidden transition-all duration-200 ${
                        expanded ? " w-36 " : " w-0  "
                      }`}
                    >
                      Admin Users
                    </span>
                    {!expanded && (
                      <span
                        className="absolute opacity-0 text-nowrap  invisible group-hover:visible duration-500 group-hover:opacity-100 left-16 top-3
                     bg-sky-400 text-black font-semibold rounded-md px-3"
                      >
                        Admin Users
                      </span>
                    )}
                  </Link>
                </li>
              </>
            )}

            <li className=" group relative items-center ">
              <button
                onClick={logout}
                className={`flex items-center px-3 gap-4 bg-red-600 hover:translate-x-2 transition-all duration-100 ${
                  expanded && "  hover:bg-slate-50 hover:text-black text-left"
                }`}
              >
                <MdLogout size={24} />
                <span
                  className={`text-nowrap py-2  overflow-hidden transition-all duration-200 ${
                    expanded ? " w-36 " : " w-0  "
                  }`}
                >
                  Logout
                </span>
                {!expanded && (
                  <span
                    className="absolute opacity-0 text-nowrap  invisible group-hover:visible duration-500 group-hover:opacity-100 left-16 top-3
                     bg-red-500 text-black font-semibold rounded-md px-3"
                  >
                    Logout
                  </span>
                )}
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
