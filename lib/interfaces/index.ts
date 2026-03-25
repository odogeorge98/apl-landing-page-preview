export interface ITable {
  tableHeaders: {
    label: string;
    key: string;
  }[];
  tableData: Record<string, any>[];
  className?: string;
}