import React from "react";

interface DisplayStringProps {
  LabelName?: string; // The string to display
}
const Titlebar: React.FC<DisplayStringProps> = ({
  LabelName = "Dashboard",
}) => {
  return (
    <div className="w-full flex justify-end p-1 bg-zinc-700">
      <h2 className="text-3xl font-medium text-white">{LabelName}</h2>
    </div>
  );
};

export default Titlebar;
