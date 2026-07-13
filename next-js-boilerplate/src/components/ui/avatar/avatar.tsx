"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { AvatarProps, AvatarVariant } from "@/types/ui/Avatar-types";

const sizes = {
  xs: "size-6 text-[0.625rem]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-lg",
} as const;

const variants: Record<AvatarVariant, string> = {
  default: "bg-surface text-muted",
  brand: "bg-brand text-brand-fg",
  success: "bg-success text-success-fg",
  warning: "bg-warning text-warning-fg",
  error: "bg-error text-error-fg",
  info: "bg-info text-info-fg",
  shiny: "bg-gradient-to-br from-blue-500 to-purple-500 text-white",
  glass: "bg-white/20 backdrop-blur-md text-white",
  neon: "bg-slate-950 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]",
  gradient: "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text",
};

export function Avatar({
  src,
  alt = "",
  fallback,
  size = "md",
  variant,
  status,
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: AvatarProps) {
  const effectiveVariant = useComponentVariant(variant);
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium",
        sizes[size],
        variants[effectiveVariant as keyof typeof variants],
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      {...props}
    >
      {showImage && (
        <Image
          src={src!}
          alt={alt}
          width={64}
          height={64}
          className="size-full object-cover"
          onError={() => setImgError(true)}
          unoptimized
        />
      )}
      {!showImage && (
        <span aria-hidden="true">{fallback.slice(0, 2).toUpperCase()}</span>
      )}
      {status === "online" && (
        <span className="border-bg bg-success absolute right-0 bottom-0 size-2.5 rounded-full border-2" />
      )}
      {status === "away" && (
        <span className="border-bg bg-warning absolute right-0 bottom-0 size-2.5 rounded-full border-2" />
      )}
    </div>
  );
}
