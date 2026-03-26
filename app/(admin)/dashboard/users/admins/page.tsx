"use client";

import { MainLayout } from "@/components/layout/dashboard";
import AdminUsersList from "@/components/users/AdminUsersList";

export default function AdminUsersPage() {
  return (
    <MainLayout>
      <AdminUsersList />
    </MainLayout>
  );
}
