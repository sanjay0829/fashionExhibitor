"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AdminLoginSchema } from "@/schemas/adminLoginSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

type FormData = z.infer<typeof AdminLoginSchema>;
const AdminLogin = () => {
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(AdminLoginSchema),
    defaultValues: { login_id: "", login_password: "" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await axios.post<ApiResponse>("/api/admin/auth", data);
      if (response.data.success) {
        toast.success("Login done successfully");
        router.push("/admin/dashboard");
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(axiosError.response?.data.message as string);
    }
  };
  return (
    <div className="w-full flex p-2 justify-center items-center min-h-screen bg-gradient-to-r from-slate-200 to-zinc-200">
      <div className="w-full max-w-3xl border border-zinc-600 rounded-2xl overflow-hidden p-1 bg-white shadow-2xl">
        <div className="w-full grid md:grid-cols-3 py-3">
          <div className="p-2 flex justify-center mx-auto">
            <Image
              width={300}
              height={200}
              alt="logo"
              src={"/img/logo.png"}
              className="max-w-60"
            />
          </div>
          <div className="md:col-span-2 flex flex-col items-center justify-center">
            <h2 className="text-center p-1 md:text-5xl text-2xl font-bold">
              EXHIBITOR ADMIN
            </h2>
            <h1 className="font-medium md:text-3xl text-xl">SECTION</h1>
          </div>
        </div>
        <hr />
        <div className="w-full md:p-10 p-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3 mx-auto max-w-sm"
            >
              <div className="grid grid-cols-1 gap-3">
                <FormField
                  control={form.control}
                  name="login_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`text-lg font-medium `}>
                        Login Id *
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
                  name="login_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={`text-lg font-medium `}>
                        Login password *
                      </FormLabel>
                      <FormControl>
                        <input
                          type="password"
                          {...field}
                          className="text-input3"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="p-1 ">
                  <Button className="cursor-pointer text-lg font-bold ">
                    LOGIN
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
