import Image from "next/image";
import React from "react";

interface DisplayStringProps {
  LabelName?: string; // The string to display
}

const Header: React.FC<DisplayStringProps> = ({ LabelName = "BUYERS" }) => {
  return (
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
          {LabelName}
        </h2>
        <h1 className="font-medium md:text-3xl text-xl">REGISTRATION</h1>
      </div>
    </div>
  );
};

export default Header;
