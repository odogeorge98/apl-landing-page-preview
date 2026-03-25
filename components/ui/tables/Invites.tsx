"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ElipsisVerticalIcon, ForwardIcon, TrashIcon } from "../Icons";
import ActionCard from "../ActionCard";
import "@/app/globals.css";
import { getStatusBadgeClasses } from "@/lib/utils/orgInvitation";
import { ITable } from "@/lib/interfaces";

interface InvitesTableProps extends ITable {
  onResend?: (email: string) => void;
  onDelete?: (id: string) => void;
  isResending?: (email: string) => boolean;
  isDeleting?: (id: string) => boolean;
}

const Table = ({ tableHeaders, tableData, className, onResend, onDelete, isResending, isDeleting }: InvitesTableProps) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handlers = {

    handleSelected(item: any) {
      setIsOpen(!isOpen);
      setSelectedRow(() => (isOpen ? null : item));
    },

    handleResend(email: string){
      onResend?.(email);
    },

    handleDelete(id: string){
      onDelete?.(id);
    },

    getActionItems(data: any){
      return [
        {
          icon: ForwardIcon,
          state: isResending?.(data.email),
          trigger: () => handlers.handleResend(data.email),
          color: "#212121",
          actionText: "Resend",
          loadingText: "Resending..."
        },
        {
          icon: TrashIcon,
          state: isDeleting?.(data.id),
          trigger: () => handlers.handleDelete(data.id),
          color: "#D00416",
          actionText: "Cancel & Delete",
          loadingText: "Deleting..."
        }
      ]
    }
  }

  return (
    <div className="custom-table max-h-[700px] overflow-y-auto">
      <table className={cn("table-auto w-full border-collapse", className)}>
        <thead onClick={() => setSelectedRow(null)}>
          <tr className="border-b border-zinc-300">
            {tableHeaders.map((header) => (
              <th
                key={header.key}
                className="sticky top-0 bg-white z-10 text-start text-sm py-4"
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((data, index) => (
            <tr
              key={index}
              className="border-b border-zinc-300 text-[#475569] text-sm"
            >
              {tableHeaders.map((header) => (
                <td key={header.key} className="py-4">
                  {header.key === "status" ? (
                    <span className={getStatusBadgeClasses(data[header.key])}>
                      {data[header.key]}
                    </span>
                  ) : (
                    data[header.key]
                  )}
                </td>
              ))}
              <td className="relative">
                <ElipsisVerticalIcon
                  className="cursor-pointer text-[#475569]"
                  click={() => handlers.handleSelected(data)}
                />
                {selectedRow &&
                  isOpen &&
                  tableData.indexOf(selectedRow) === index && (
                    <ActionCard
                    actionItems={handlers.getActionItems(data)}
                    onClose={() => handlers.handleSelected(data)}
                    />
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
