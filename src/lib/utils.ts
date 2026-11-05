import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format amount into Indian Rupee style
 * e.g., formatRupee(100) -> "₹100", formatRupee(1500) -> "₹1,500"
 */
export function formatRupee(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ISO date or YYYY-MM-DD string to "DD MMM YYYY" (e.g. "05 Nov 2026")
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  try {
    // If string is YYYY-MM-DD, parse explicitly to avoid UTC shift
    const parts = dateString.split("T")[0].split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return format(d, "dd MMM yyyy");
    }
    return format(parseISO(dateString), "dd MMM yyyy");
  } catch (e) {
    return dateString;
  }
}

/**
 * Format duration in hours and minutes
 * e.g., 0 hrs, 25 mins -> "25 mins"
 * 1 hr, 15 mins -> "1 hr 15 mins"
 */
export function formatDuration(hours: number = 0, minutes: number = 0): string {
  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
  }
  if (minutes > 0 || hours === 0) {
    parts.push(`${minutes} min${minutes !== 1 ? 's' : ''}`);
  }
  return parts.join(' ');
}

/**
 * Returns today's date in YYYY-MM-DD format based on local client time
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Export data array to CSV file download
 */
export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      headers
        .map(fieldName => {
          let val = row[fieldName] ?? '';
          if (typeof val === 'string') {
            // Escape double quotes
            val = `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(',')
    )
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
