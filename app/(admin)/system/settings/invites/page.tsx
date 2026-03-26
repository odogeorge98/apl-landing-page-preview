"use client";

import "@/app/globals.css";
import { MainLayout } from "@/components/layout/dashboard";
import { ArrowDownAltIcon, ArrowDownIcon, DownloadIcon } from "@/components/ui/Icons";
import Pagination from "@/components/ui/Pagination";
import { InvitesTable } from "@/components/ui/tables";
import { useInvitations, useResendInvite, useDeleteInvite } from "@/lib/hooks/organization/use-invitations";
import { downloadExcel } from "@/lib/utils";
import { transformInvitationsToTableData } from "@/lib/utils/orgInvitation";
import dayjs from "dayjs";
import React, { useState } from "react";
import AdminSelect from "@/components/ui/AdminSelect";

const tableHeaders = [
  {
    label: "Email",
    key: "email",
  },
  {
    label: "Role",
    key: "role",
  },
  {
    label: "Org Role",
    key: "orgRole",
  },
  {
    label: "Status",
    key: "status",
  },
  {
    label: "Created Date",
    key: "createdAt",
  },
  {
    label: "Expires At",
    key: "expiresAt",
  },
];

const page = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [status, setStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM"));
  const [searchQuery, setSearchQuery] = useState("");

  const selectedMonth = dayjs(selectedDate).month() + 1;
  const selectedYear = dayjs(selectedDate).year();

  const {
    data: invitationsResponse,
    isLoading,
    error,
  } = useInvitations({
    page: currentPage,
    limit: itemsPerPage,
    status: status || undefined,
    month: selectedMonth,
    year: selectedYear,
    search: searchQuery || undefined,
  });

  const resendInviteMutation = useResendInvite();
  const deleteInviteMutation = useDeleteInvite();

  const tableData = invitationsResponse?.data?.invitations
    ? transformInvitationsToTableData(invitationsResponse.data.invitations)
    : [];

  // Use API pagination data
  const totalPages = invitationsResponse?.data?.pagination?.totalPages || 1;
  const paginatedData = tableData;

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedDate(e.target.value);
    setCurrentPage(1);
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }

  const handleResendInvite = (email: string) => {
    resendInviteMutation.mutate({ email });
  };

  const handleDeleteInvite = (id: string) => {
    deleteInviteMutation.mutate(id);
  };

  const isResending = (email: string) => {
    return resendInviteMutation.isPending;
  };

  const isDeleting = (id: string) => {
    return deleteInviteMutation.isPending;
  };
  return (
    <MainLayout>
      <div className="p-10 mt-28 overflow-x-clip">
        <div className="container">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-[28px] font-bold">Organization Invites</h3>
            <div className="relative">
              <input
                type="month"
                className="month-input border border-[#E4E4E4] p-2 rounded-sm text-base"
                placeholder="Last month"
                value={selectedDate}
                onChange={handleDateChange}
              />
              <span className="absolute right-2 top-2 custom-arrow">
                <ArrowDownAltIcon />
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center mt-10">
            <div className="flex gap-2">
              <input
                placeholder="Search"
                className="w-[500px] px-3 py-2 border rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed border-gray-300 focus:ring-[#5F3DF4]"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <div className="min-w-[160px] max-w-[220px]">
                <AdminSelect
                  variant="light"
                  placeholder="Status"
                  options={[
                    { value: "", label: "All statuses" },
                    { value: "ACCEPTED", label: "Accepted" },
                    { value: "PENDING", label: "Pending" },
                    { value: "EXPIRED", label: "Expired" },
                    { value: "REJECTED", label: "Rejected" },
                  ]}
                  value={status}
                  onValueChange={(v) => {
                    setStatus(v);
                    setCurrentPage(1);
                  }}
                  aria-label="Filter by status"
                />
              </div>
            </div>
            <div>
              <button
                className="max-w bg-[#F7F7F7] py-2 px-4 border border-[#E4E4E4] text-sm font-medium inline-flex gap-2 rounded-sm cursor-pointer hover:shadow-[0_2px_24px_#E4E4E4]"
                onClick={() =>
                  downloadExcel({ tableData, tableHeaders, page: "invites" })
                }
              >
                <span className="mt-[2px]">
                  <DownloadIcon />
                </span>
                <span>Export</span>
              </button>
            </div>
          </div>
          <div className="my-10">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5E3DF4]"></div>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-red-500 text-lg">
                  Could not load invitations
                </div>
              </div>
            ) : (
              <>
                <InvitesTable
                  tableHeaders={tableHeaders}
                  tableData={paginatedData}
                  className="w-[100%]"
                  onResend={handleResendInvite}
                  onDelete={handleDeleteInvite}
                  isResending={isResending}
                  isDeleting={isDeleting}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  onChange={onChange}
                  totalData={
                    invitationsResponse?.data?.pagination?.totalItems || 0
                  }
                />
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default page;
