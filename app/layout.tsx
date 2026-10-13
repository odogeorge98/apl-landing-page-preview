import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/Toaster";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { AuthProvider } from "@/lib/providers/AuthProvider";
import { ErrorBoundaryWrapper } from "@/components/wrappers/ErrorBoundaryWrapper";

const euclidCircularA = localFont({
  src: [
    {
      path: "../public/fonts/EuclidCircularA-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/EuclidCircularA-LightItalic.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../public/fonts/EuclidCircularA-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/EuclidCircularA-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/EuclidCircularA-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/EuclidCircularA-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../public/fonts/EuclidCircularA-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/EuclidCircularA-SemiBoldItalic.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../public/fonts/EuclidCircularA-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/EuclidCircularA-Bold Italic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-euclid-circular-a",
});

export const metadata: Metadata = {
  title: "Nugi Innovations Portal",
  description:
    "Sign in to manage rides, drivers, payments, and platform operations for Nugi Innovations.",
  icons: {
    icon: "/ni-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" data-scroll-behavior="smooth">
      <body className={`${euclidCircularA.variable} antialiased min-h-full`}>
        <ErrorBoundaryWrapper>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </QueryProvider>
        </ErrorBoundaryWrapper>
      </body>
    </html>
  );
}
