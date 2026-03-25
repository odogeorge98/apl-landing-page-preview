"use client";

import { useInvitations, useResendInvite, useDeleteInvite, useOrganizationInvite } from "@/lib/hooks/organization/use-invitations";
import { showValidationError } from "@/lib/utils/error-handler";
import React, { useState } from "react";
import * as yup from "yup";
import InputField from "../../InputField";
import { Modal } from "../../Modal";
import InvitesTable from "../../tables/Invites";
import { transformInvitationsToTableData } from "@/lib/utils/orgInvitation";
import { IModal } from "@/lib/interfaces/organisation";



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

const Invite = ({ open, setTrigger }: IModal) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Fetch invitations data
  const {
    data: invitationsResponse,
    isLoading: invitationsLoading,
    error: invitationsError,
  } = useInvitations();

  const tableData = invitationsResponse?.data?.invitations
    ? transformInvitationsToTableData(
        invitationsResponse.data.invitations.slice(0, 4)
      ) 
    : [];

  const { mutate: inviteOrganization, isPending: inviteLoading } =
    useOrganizationInvite({
      onSuccess: () => {
        setEmail("");
        setError("");

      },
    });

  const resendInviteMutation = useResendInvite();
  const deleteInviteMutation = useDeleteInvite();

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

  const handlers = {
    onChange({ target }: React.ChangeEvent<HTMLInputElement>) {
      setEmail(target.value);
    },

    async validation(payload: { email: string }) {
      const schema = yup.object({
        email: yup
          .string()
          .email("Please enter a valid email address")
          .required("Email is required"),
      });
      return await schema.validate(payload, { abortEarly: false });
    },

    async handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setError("");
      try {
        // Validation
        await handlers.validation({ email });
        setLoading(true);

        // Call the organization invite mutation
        inviteOrganization({ email });
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          const validationErrors: { email?: string } = {};
          error.inner.forEach((err) => {
            if (err.path) {
              validationErrors[err.path as keyof typeof validationErrors] =
                err.message;
            }
          });
          setError(validationErrors.email || "");
          // Show validation error toast
          showValidationError(validationErrors);
        }
      } finally {
        setLoading(false);
      }
    },

    onClose() {
      setEmail("");
      // Close modal
      setTrigger(false);
    },
  };
  return (
    <Modal
      size="6xl"
      title="Organization Invites"
      open={open}
      onOpenChange={() => handlers.onClose()}
      headerCss="flex-row justify-between -mt-4 gap-0"
      headerTitleCss="text-[16px]"
    >
      <form className="mt-6" onSubmit={(e) => handlers.handleSubmit(e)}>
        <div className="flex gap-5 w-full">
          <InputField
            label={"Add organization"}
            name={"email"}
            placeholder={"Enter email"}
            handlers={handlers}
            wrapperCss={"w-[90%] gap-4"}
            error={error}
            value={email}
          />
          <div className="mt-11">
            <button
              type="submit"
              disabled={loading || inviteLoading}
              className="w-max py-[10px] cursor-pointer px-4 rounded-[8px] bg-[#5F3DF4] text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || inviteLoading ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </div>
      </form>
      <div className="mt-5">
        <h3 className="text-xl font-semibold">Recent Invites</h3>
      </div>
      {invitationsLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5E3DF4]"></div>
        </div>
      ) : invitationsError ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-red-500 text-sm">Could not load invitations</div>
        </div>
      ) : (
        <InvitesTable 
          tableHeaders={tableHeaders} 
          tableData={tableData}
          onResend={handleResendInvite}
          onDelete={handleDeleteInvite}
          isResending={isResending}
          isDeleting={isDeleting}
        />
      )}
    </Modal>
  );
};

export default Invite;
