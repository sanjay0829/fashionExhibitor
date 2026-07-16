import Header from "@/components/header";
import Image from "next/image";
import React from "react";

const ThanksPage = () => {
  return (
    <div className="w-full flex p-2 justify-center items-center min-h-screen bg-gradient-to-r from-slate-200 to-zinc-200">
      <div className="w-full max-w-3xl border border-zinc-600 rounded-2xl overflow-hidden p-1 bg-white shadow-2xl">
        <div className="w-full flex justify-center py-3">
          <div className="p-2 flex justify-center mx-auto">
            <Image
              width={300}
              height={200}
              alt="logo"
              src={"/img/logo.png"}
              className="max-w-60"
            />
          </div>
        </div>
        <div>
          <hr />
        </div>
        <div className="py-4 md:px-4">
          <h2 className="md:text-4xl text-2xl text-center">
            Registration already completed
          </h2>
        </div>
      </div>
    </div>
  );
};

export default ThanksPage;
