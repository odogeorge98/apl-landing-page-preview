// import useAuthStore from "@/lib/store/auth";

// /**
//  * Authentication initialization utility
//  * Zustand persist now handles hydration automatically.
//  */

// /**
//  * Initialize authentication state
//  * No-op because Zustand persist rehydrates automatically.
//  */
// export const initializeAuth =
//   async (): Promise<void> => {
//     return;
//   };

// /**
//  * Check if auth is initialized
//  */
// export const isAuthInitialized =
//   (): boolean => {
//     const { isInitialized } =
//       useAuthStore.getState();

//     return isInitialized;
//   };

// /**
//  * Get current auth state
//  */
// export const getAuthState = () => {
//   const {
//     authUser,
//     token,
//     isInitialized,
//   } = useAuthStore.getState();

//   return {
//     user: authUser,
//     token,
//     isAuthenticated:
//       !!authUser && !!token,
//     isInitialized,
//   };
// };

// /**
//  * Wait for auth initialization
//  */
// export const waitForAuthInit =
//   (): Promise<void> => {
//     return new Promise((resolve) => {
//       const { isInitialized } =
//         useAuthStore.getState();

//       if (isInitialized) {
//         resolve();
//         return;
//       }

//       const unsubscribe =
//         useAuthStore.subscribe((state) => {
//           if (state.isInitialized) {
//             unsubscribe();
//             resolve();
//           }
//         });
//     });
//   };