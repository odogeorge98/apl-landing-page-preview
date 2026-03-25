"use client"

import * as React from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./Dialog"
import { cn } from "@/lib/utils"

export interface ModalProps {
  children?: React.ReactNode
  trigger?: React.ReactNode
  title?: string
  description?: string
  footer?: React.ReactNode
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showCloseButton?: boolean
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl",
  headerCss?: string
  headerTitleCss?: string;
}

const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md", 
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "3xl": "sm:max-w-3xl",
  "4xl": "sm:max-w-4xl",
  "5xl": "sm:max-w-5xl",
  "6xl": "sm:max-w-6xl",
}

export function Modal({
  children,
  trigger,
  title,
  description,
  footer,
  className,
  open,
  onOpenChange,
  showCloseButton = true,
  size = "lg",
  headerCss,
  headerTitleCss
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(sizeClasses[size], className)}
        showCloseButton={showCloseButton}
      >
        {(title || description) && (
          <DialogHeader className={headerCss}>
            {title && <DialogTitle className={headerTitleCss}>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}

export { DialogClose as ModalClose }