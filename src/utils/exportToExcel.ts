import * as XLSX from "xlsx";
import { Transaction } from "@/components/pages/transactions/types";
import dayjs from "dayjs";

/**
 * Export transactions to Excel file
 * @param transactions - Array of transactions to export
 * @param filename - Name of the file (without extension)
 */
export function exportTransactionsToExcel(
  transactions: Transaction[],
  filename: string = "transactions",
) {
  // Prepare data for Excel
  const data = transactions.map((transaction) => ({
    Ngày: transaction.date,
    "Danh mục": transaction.merchant,
    "Mô tả": transaction.description || "",
    "Tài khoản": transaction.account,
    Loại: transaction.amount >= 0 ? "Thu nhập" : "Chi tiêu",
    "Số tiền": Math.abs(transaction.amount),
    "Trạng thái":
      transaction.status === "verified" ? "Đã xác minh" : "Chưa xác minh",
  }));

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const colWidths = [
    { wch: 12 }, // Ngày
    { wch: 20 }, // Danh mục
    { wch: 30 }, // Mô tả
    { wch: 20 }, // Tài khoản
    { wch: 12 }, // Loại
    { wch: 15 }, // Số tiền
    { wch: 15 }, // Trạng thái
  ];
  ws["!cols"] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Giao dịch");

  // Generate filename with current date
  const timestamp = dayjs().format("YYYY-MM-DD_HHmmss");
  const fullFilename = `${filename}_${timestamp}.xlsx`;

  // Write file
  XLSX.writeFile(wb, fullFilename);
}

/**
 * Export transactions to Excel file with custom headers (for internationalization)
 * @param transactions - Array of transactions to export
 * @param headers - Custom headers for columns
 * @param filename - Name of the file (without extension)
 */
export function exportTransactionsToExcelWithHeaders(
  transactions: Transaction[],
  headers: {
    date: string;
    category: string;
    description: string;
    account: string;
    type: string;
    amount: string;
    status: string;
  },
  typeLabels: {
    income: string;
    expense: string;
  },
  statusLabels: {
    verified: string;
    unverified: string;
  },
  filename: string = "transactions",
) {
  // Prepare data for Excel
  const data = transactions.map((transaction) => ({
    [headers.date]: transaction.date,
    [headers.category]: transaction.merchant,
    [headers.description]: transaction.description || "",
    [headers.account]: transaction.account,
    [headers.type]:
      transaction.amount >= 0 ? typeLabels.income : typeLabels.expense,
    [headers.amount]: Math.abs(transaction.amount),
    [headers.status]:
      transaction.status === "verified"
        ? statusLabels.verified
        : statusLabels.unverified,
  }));

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const colWidths = [
    { wch: 12 }, // Date
    { wch: 20 }, // Category
    { wch: 30 }, // Description
    { wch: 20 }, // Account
    { wch: 12 }, // Type
    { wch: 15 }, // Amount
    { wch: 15 }, // Status
  ];
  ws["!cols"] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Transactions");

  // Generate filename with current date
  const timestamp = dayjs().format("YYYY-MM-DD_HHmmss");
  const fullFilename = `${filename}_${timestamp}.xlsx`;

  // Write file
  XLSX.writeFile(wb, fullFilename);
}
