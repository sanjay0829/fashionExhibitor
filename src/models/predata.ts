import mongoose, { Schema, Document } from "mongoose";

export interface PreData extends Document {
  name: string;
  email: string;
  mobile: string;
  company: string;
  city: string;
  country_code: string;
}

function toTitleCase(str: string) {
  return str
    .split(" ") // Split the string into words
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(), // Capitalize first letter and lowercase the rest
    )
    .join(" "); // Join the words back together
}

const PredataSchema: Schema<PreData> = new Schema(
  {
    name: {
      type: String,
      set: toTitleCase,
      trim: true,
      required: [true, "Name is required"],
    },
    email: { type: String, trim: true },
    company: { type: String, trim: true },
    city: { type: String, trim: true },
    mobile: {
      type: String,
      trim: true,
      required: [true, "Mobile No is required"],
    },
    country_code: { type: String, trim: true },
  },
  { timestamps: true },
);

const PredataModel =
  (mongoose.models.Predata as mongoose.Model<PreData>) ||
  mongoose.model<PreData>("Predata", PredataSchema);

export default PredataModel;
