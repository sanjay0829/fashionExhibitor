import Header from "@/components/header";
import React from "react";

const ThanksPage = () => {
  return (
    <div className="w-full flex p-2 justify-center items-center min-h-screen bg-gradient-to-r from-slate-200 to-zinc-200">
      <div className="w-full max-w-3xl border border-zinc-600 rounded-2xl overflow-hidden p-1 bg-white shadow-2xl">
        <Header />
        <div>
          <hr />
        </div>
        <div className="py-4 md:px-4">
          <h2 className="md:text-4xl text-2xl text-center">
            Registration done successfully !
          </h2>
          <p className="text-center">
            Your QR code and Registration Number will be Whatsapped to you
            shortly
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThanksPage;
