import React from "react";
import { format, parseISO } from "date-fns";

interface GreetingProps {
  datestring: string;
}

const Dateformat: React.FC<GreetingProps> = ({ datestring }) => {
  const date = parseISO(datestring);
  return <time>{format(date, "d-LLL-yyyy hh:mm a")}</time>;
};

export default Dateformat;
