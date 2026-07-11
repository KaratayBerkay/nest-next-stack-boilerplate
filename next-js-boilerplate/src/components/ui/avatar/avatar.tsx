"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { AvatarProps } from "@/types/ui/Avatar-types";

const sizes = {
  xs: "size-6 text-[0.625rem]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-lg",
} as const;

const variants = {
  default: "bg-surface text-muted",
  brand: "bg-brand text-brand-fg",
  success: "bg-success text-success-fg",
  warning: "bg-warning text-warning-fg",
  error: "bg-error text-error-fg",
  info: "bg-info text-info-fg",
} as const;

export function Avatar({
  src,
  alt = "",
  fallback,
  size = "md",
  variant = "default",
  status,
  className,
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium",
        sizes[size],
        variants[variant],
        className,
      )}
      {...props}
    >
      {showImage && (
        <img
          src={src}
          alt={alt}
          className="size-full object-cover"
          onError={() => setImgError(true)}
        />
      )}
      {!showImage && (
        <span aria-hidden="true">{fallback.slice(0, 2).toUpperCase()}</span>
      )}
      {status === "online" && (
        <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-bg bg-success" />
      )}
      {status === "away" && (
        <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-bg bg-warning" />
      )}
    </div>
  );
}
