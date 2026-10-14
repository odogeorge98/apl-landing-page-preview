"use client";

import { useQuery } from "@tanstack/react-query";

import { adminsApi } from "@/lib/api/users/admins";
import type { GetAdminsParams } from "@/lib/interfaces/users/admins";

export const adminsQueryKeys = {
  all: ["admins"] as const,
  lists: () => [...adminsQueryKeys.all, "list"] as const,
  list: (params: GetAdminsParams) =>
    [...adminsQueryKeys.lists(), params] as const,
};

/** Fetch one cursor-paginated admins list. */
export function useAdminsList(params: GetAdminsParams) {
  return useQuery({
    queryKey: adminsQueryKeys.list(params),
    queryFn: () => adminsApi.list(params),
  });
}
