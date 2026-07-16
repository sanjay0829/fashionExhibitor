import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { User } from "@/models/user";

const formatDate = (dateString: Date) => {
  if (!dateString) return ""; // Handle empty dates
  const date = new Date(dateString);

  const day = date.getDate().toString().padStart(2, "0"); // Ensure two-digit day
  const month = date.toLocaleString("en-GB", { month: "short" }); // Get short month
  const year = date.getFullYear();
  const hour = date.getHours();
  const minute = date.getMinutes();

  return `${day}-${month}-${year} ${hour}:${minute}`;
};

export function exportToExcel(
  users: User[],
  filename: string = "RegData.xlxs",
) {
  try {
    if (users.length == 0) return;

    const visitDates = ["22nd July 2026", "23rd July 2026", "24th July 2026"];

    const data = users.map((user) => {
      const attendDates = user.attend_date || [];

      const visitColumns = visitDates.reduce(
        (acc, date) => {
          acc[date] = attendDates.includes(date) ? "Yes" : "";
          return acc;
        },
        {} as Record<string, string>,
      );

      const flattenedUser: any = {
        reg_no: user.reg_no,
        fullname: user.name,
        email: user.email,
        mobile: user.mobile,
        city: user.city,
        state: user.state,
        country: user.country,
        company: user.company,
        category: user.reg_category,
        reg_date: user.createdAt,
        photo_url: user.photo_url,
        ...visitColumns,
        visiting_dates: attendDates.join(", "),
      };

      return flattenedUser;
    });

    const formattedUsers = data?.map((user) => ({
      ...user,
      reg_date: formatDate(user?.reg_date), // Format date before adding
    }));

    const ws = XLSX.utils.json_to_sheet(formattedUsers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");

    // Convert to buffer and trigger download
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(dataBlob, filename);
  } catch (error) {}
}
