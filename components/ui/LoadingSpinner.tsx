import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
  text = "Loading...",
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
          sizeClasses[size],
          className
        )}
      />
      {text && <p className="text-sm text-white/60 animate-pulse">{text}</p>}
    </div>
  );
};

interface AuthLoadingProps {
  className?: string;
}

export const AuthLoading: React.FC<AuthLoadingProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "login-page-landing min-h-screen flex items-center justify-center bg-[#0e0b16]",
        className
      )}
    >
      <div className="text-center">
        <LoadingSpinner size="lg" text="PEPP Cruise Loading..." className="border-white/15 border-t-white/70" />
      </div>
    </div>
  );
};

export default LoadingSpinner;
