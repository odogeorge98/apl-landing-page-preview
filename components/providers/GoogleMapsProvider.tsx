// components/providers/GoogleMapsProvider.tsx

"use client";

import {
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { GOOGLE_MAPS_LIBRARIES } from "@/lib/constants/google-maps";

type GoogleMapsContextType = {
  isLoaded: boolean;
  loadError?: Error;
};

const GoogleMapsContext =
  createContext<GoogleMapsContextType>({
    isLoaded: false,
  });

export function GoogleMapsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  return (
    <GoogleMapsContext.Provider
      value={{
        isLoaded,
        loadError,
      }}
    >
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps() {
  return useContext(GoogleMapsContext);
}