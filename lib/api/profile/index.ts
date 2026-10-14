
import { http } from "@/lib/utils/http";
import type {
  AdminProfile,
  AdminProfileApiResponse,
  StudentProfile,
  StudentProfileApiResponse,
  TutorProfile,
  TutorProfileApiResponse,
} from "@/lib/interfaces/profile";

export const profileApi = {
  getAdminProfile: async (): Promise<AdminProfile> => {
    const response = await http.get<AdminProfileApiResponse>(
      "/admin/profile",
    );

    const result = response.data;

    if (result.status !== "success") {
      throw new Error(
        result.message || "Failed to retrieve admin profile.",
      );
    }

    return result.data;
  },

  getStudentProfile: async (): Promise<StudentProfile> => {
    const response = await http.get<StudentProfileApiResponse>(
      "/students/profile",
    );

    const result = response.data;

    if (result.status !== "success") {
      throw new Error(
        result.message || "Failed to retrieve student profile.",
      );
    }

    if (!result.data || !Array.isArray(result.data.programmes)) {
      throw new Error("The student profile response was incomplete.");
    }

    return result.data;
  },

  getTutorProfile: async (): Promise<TutorProfile> => {
    const response = await http.get<TutorProfileApiResponse>(
      "/tutors/profile",
    );

    const result = response.data;

    if (result.status !== "success") {
      throw new Error(
        result.message || "Failed to retrieve tutor profile.",
      );
    }

    if (!result.data) {
      throw new Error("The tutor profile response was incomplete.");
    }

    return result.data;
  },
};


// import { http } from "@/lib/utils/http";
// import useAuthStore from "@/lib/store/auth";
// import { UserType } from "@/lib/types/users";

// import type {
//   AdminProfile,
//   AdminProfileApiResponse,
// } from "@/lib/interfaces/profile";

// export const profileApi = {
//   getProfile: async (): Promise<AdminProfile> => {
//     const { authUser } = useAuthStore.getState();
//     const role = authUser?.role;

//     if (!role) {
//       throw new Error(
//         "Unable to retrieve profile: no authenticated user role was found.",
//       );
//     }

//     const profilePathByRole: Record<UserType, string> = {
//       [UserType.ADMIN]: "/admin/profile",
//       [UserType.STUDENT]: "/student/profile",
//       [UserType.TUTOR]: "/tutor/profile",
//     };

//     const profilePath = profilePathByRole[role as UserType];

//     if (!profilePath) {
//       throw new Error(
//         `Unable to retrieve profile: unsupported user role "${role}".`,
//       );
//     }

//     const response =
//       await http.get<AdminProfileApiResponse>(profilePath);

//     const result = response.data;

//     if (result.status !== "success") {
//       throw new Error(
//         result.message || "Failed to retrieve profile.",
//       );
//     }

//     return result.data;
//   },
// };
