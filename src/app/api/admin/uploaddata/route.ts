import dbConnect from "@/lib/dbConnect";
import { NextRequest } from "next/server";
import * as XLSX from "xlsx";
import PredataModel from "@/models/predata";

export async function POST(request: NextRequest) {
  await dbConnect();
  try {
    const fileData = await request.formData();
    const file = fileData.get("excel_file") as File;

    if (!file) {
      return Response.json(
        { success: false, message: "File not found" },
        { status: 400 }
      );
    }

    // Read Excel
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data: any[] = XLSX.utils.sheet_to_json(sheet);

    // Normalize mobile numbers consistently
    const normalizeMobile = (mobile: any): string | null => {
      if (mobile === undefined || mobile === null) return null;
      // Convert to string, remove non-digits, and ensure consistent format
      const cleaned = mobile.toString().replace(/\D/g, "");
      return cleaned.length > 0 ? cleaned : null;
    };

    // Normalize country code to ensure it starts with +
    // If country code is null/undefined, default to +91
    const normalizeCountryCode = (country_code: any): string => {
      if (country_code === undefined || country_code === null) {
        return "+91"; // Default to India's country code
      }

      let code = country_code.toString().trim();

      // Remove any existing + signs
      code = code.replace(/^\+/, "");

      // Add + sign if it's not there and the code is not empty
      if (code.length > 0) {
        return `+${code}`;
      }

      return "+91"; // Default to India's country code if empty after cleaning
    };

    // Process data and collect valid mobile numbers
    const processedData = data
      .map((row) => {
        const mobile = normalizeMobile(row.mobile);
        const country_code = normalizeCountryCode(row.country_code); // Note the underscore
        return {
          ...row,
          normalizedMobile: mobile,
          country_code: country_code, // This will always have a value now
        };
      })
      .filter((row) => row.normalizedMobile !== null);

    const mobilesInFile = processedData.map(
      (row) => row.normalizedMobile as string
    );

    // Find existing records using $in with string values
    const existingRecords = await PredataModel.find({
      mobile: { $in: mobilesInFile },
    }).lean();

    // Create Set of existing mobile numbers for faster lookup
    const existingMobiles = new Set(
      existingRecords.map((record) => normalizeMobile(record.mobile) || "")
    );

    // Separate new and duplicate records
    const newRecords = processedData.filter(
      (row) => !existingMobiles.has(row.normalizedMobile as string)
    );

    const duplicateRecords = processedData.filter((row) =>
      existingMobiles.has(row.normalizedMobile as string)
    );

    // Insert new records (only if they have mobile numbers)
    let insertResult = null;
    const recordsToInsert = newRecords.map(
      ({ normalizedMobile, ...rest }) => rest
    );

    if (recordsToInsert.length > 0) {
      insertResult = await PredataModel.insertMany(recordsToInsert, {
        ordered: false, // Continue on error
      }).catch((err) => {
        console.error("Partial insert error:", err);
        return err.insertedDocs; // Return what was successfully inserted
      });
    }

    // Prepare response data
    const responseData = {
      success: true,
      insertedCount: Array.isArray(insertResult)
        ? insertResult.length
        : insertResult?.insertedCount || 0,
      duplicateCount: duplicateRecords.length,
    };

    // If no duplicates, return success message
    if (duplicateRecords.length === 0) {
      return Response.json(responseData, { status: 200 });
    }

    // Combine duplicate records from file with existing DB records
    const allDuplicates = [
      ...duplicateRecords.map(({ normalizedMobile, ...rest }) => rest),
      ...existingRecords.filter((record) =>
        mobilesInFile.includes(normalizeMobile(record.mobile) as string)
      ),
    ];

    // Create Excel file with duplicates
    const duplicateWorkbook = XLSX.utils.book_new();
    const duplicateSheet = XLSX.utils.json_to_sheet(allDuplicates);
    XLSX.utils.book_append_sheet(
      duplicateWorkbook,
      duplicateSheet,
      "Duplicates"
    );

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(duplicateWorkbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    // Create response with Excel file
    const headers = new Headers();
    headers.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    headers.set("Content-Disposition", "attachment; filename=duplicates.xlsx");
    headers.set("X-Inserted-Count", responseData.insertedCount.toString());
    headers.set("X-Duplicate-Count", responseData.duplicateCount.toString());

    return new Response(excelBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error processing Excel file:", error);
    return Response.json(
      { success: false, message: "Error processing Excel file" },
      { status: 500 }
    );
  }
}
