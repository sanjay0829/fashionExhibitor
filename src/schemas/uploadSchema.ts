import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
];

export const UploadSchema = z.object({
  upload_excel_file: z
    .custom<FileList>((val) => val instanceof FileList && val.length > 0, {
      message: "File is required.",
    })
    .refine(
      (files) => {
        if (!files || files.length === 0) return false; // Ensures a file is selected
        return files[0].size <= MAX_FILE_SIZE; // Checks file size
      },
      { message: "Max file size allowed is 5 MB." }
    )
    .refine(
      (files) => {
        if (!files || files.length === 0) return false; // Ensures a file is selected
        return ACCEPTED_FILE_TYPES.includes(files[0].type);
      },
      { message: "Only .xlsx and .xls formats are supported." }
    ),
});
