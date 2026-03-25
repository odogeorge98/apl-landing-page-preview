import { ITable } from "./interfaces";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "@/components/ui/Toaster";
import { colors } from "./data";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Function to convert JSON to CSV format **/
function convertToCSV({tableData, tableHeaders}: ITable){

  const exportHeaders = tableHeaders.filter(header => 
    header.key !== 'action' && 
    header.label !== 'Action'
  );
  /** Create header row **/
  const headerRow = exportHeaders.map((header: any) => header.label).join(',');
  
  /** Create data rows **/
  const dataRows = tableData.map((row: any) => {
    return tableHeaders.map((header: any) => {
      const value = row[header.key];
      /** Handle values that might contain commas or quotes **/
      return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
        ? `"${value.replace(/"/g, '""')}"` 
        : value;
    }).join(',')
  }
  );
  
  return [headerRow, ...dataRows].join('\n');
};

/** Function to download as Excel (CSV format) **/
export const downloadExcel = ({ tableData, tableHeaders, page}: any) => {
  try {
    const csvContent = convertToCSV({ tableData, tableHeaders });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${page}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    toast.error('Error downloading file. Please try again.');
  }
};

/** This allows dynamic color and status matching */
export function getStatusColor(status: string){
  const bgColor = colors?.find(color => color.status === status)?.bgColor
  const textColor = colors?.find(color => color.status === status)?.textColor

  return {
    bgColor,
    textColor
  }

}