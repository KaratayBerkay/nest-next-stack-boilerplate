"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import type { AvatarProps } from "@/types/ui/Avatar-types";

const sizes = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-lg",
} as const;

export function Avatar({
  src,
  alt = "",
  fallback,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;

  return (
    <div
      className={cn(
        "bg-surface text-muted relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium",
        sizes[size],
        className,
      )}
      {...props}
    >
      {showImage && (
        <Image
          src={src!}
          alt={alt}
          fill
          className="object-cover"
          onError={() => setImgError(true)}
        />
      )}
      {!showImage && (
        <span aria-hidden="true">{fallback.slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
}
