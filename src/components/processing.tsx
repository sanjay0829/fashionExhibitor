import { Loader } from "lucide-react";
import React from "react";
import { TbLoader3 } from "react-icons/tb";

interface DisplayStringProps {
  LabelName?: string; // The string to display
}

const ProcessingOverlay: React.FC<DisplayStringProps> = ({
  LabelName = "Processing",
}) => {
  return (
    <div className="min-h-screen bg-black/60 fixed left-0 top-0 bottom-0 w-full flex justify-center items-center z-10">
      <div className="max-w-xl bg-white shadow-lg rounded-lg p-5 text-center text-5xl">
        <TbLoader3 className="animate-spin duration-500 transition-all mx-auto m-10 text-[10vw]" />
        <p className="text-center animate-pulse">
          {LabelName} <span className="animate-pulse duration-100">.</span>
          <span className="animate-pulse duration-200">.</span>
          <span className="animate-pulse duration-300">.</span>
          <span className="animate-pulse duration-500">.</span>
        </p>
      </div>
    </div>
  );
};

export default ProcessingOverlay;
