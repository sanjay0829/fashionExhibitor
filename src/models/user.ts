import mongoose, { Schema, Document } from "mongoose";

export interface User extends Document {
  title: string;
  reg_no: string;
  reg_category: string;
  reg_type: string;
  name: string;
  email: string;
  mobile: string;
  country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  photo_url: string;
  attend_date: string[];
  createdAt?: Date;
  reg_status: boolean;
}

function toTitleCase(str: string) {
  return str
    .split(" ") // Split the string into words
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() // Capitalize first letter and lowercase the rest
    )
    .join(" "); // Join the words back together
}

const UserSchema: Schema<User> = new Schema(
  {
    title: { type: String },
    reg_no: {
      type: String,
      trim: true,
      required: [true, "Registration number is required "],
      unique: true,
    },
    reg_category: {
      type: String,
      trim: true,
      required: [true, "Category is required "],
    },
    reg_type: { type: String, trim: true },
    name: {
      type: String,
      set: toTitleCase,
      trim: true,
      required: [true, "Name is required"],
    },
    email: { type: String, trim: true },
    mobile: { type: String, trim: true },
    country_code: { type: String, trim: true },
    company: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    attend_date: [{ type: String, trim: true }],
    photo_url: { type: String, trim: true },
    reg_status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export default UserModel;
