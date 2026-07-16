import mongoose, { Schema, Document } from "mongoose";

export interface Adminuser extends Document {
  admin_name: string;
  login_id: string;
  login_password: string;
  admin_type: string;
}

const AdminSchema: Schema<Adminuser> = new Schema(
  {
    admin_name: { type: String, required: [true, "Name is required"] },
    login_id: { type: String, required: [true, "Login Id is required"] },
    login_password: { type: String, required: [true, "Password is required"] },
    admin_type: { type: String, required: [true, "Admin type is required"] },
  },
  { timestamps: true }
);

const AdminModel =
  (mongoose.models.Admin as mongoose.Model<Adminuser>) ||
  mongoose.model<Adminuser>("Adminuser", AdminSchema);

export default AdminModel;
