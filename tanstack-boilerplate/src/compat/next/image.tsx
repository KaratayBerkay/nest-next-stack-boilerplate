"use client";
// Compat shim for `next/image`.
// Renders a plain <img> with the next/image prop contract: `fill` positioning,
// `priority` → eager + high fetch priority, lazy loading by default. There is
// no optimization pipeline (no resizing/AVIF re-encode) — remote images are
// loaded from their source URL, which matches how this app used the loader
// (its `images.remotePatterns` only allow-listed hosts).

import { forwardRef } from "react";
import type { CSSProperties, ImgHTMLAttributes } from "react";

export interface StaticImageData {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
  blurWidth?: number;
  blurHeight?: number;
}

interface StaticRequire {
  default: StaticImageData;
}

export type StaticImport = StaticRequire | StaticImageData;

export type ImageLoader = (p: {
  src: string;
  width: number;
  quality?: number;
}) => string;

export interface ImageProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet" | "alt" | "width" | "height"
> {
  src: string | StaticImport;
  alt: string;
  width?: number | `${number}`;
  height?: number | `${number}`;
  fill?: boolean;
  loader?: ImageLoader;
  quality?: number | `${number}`;
  priority?: boolean;
  placeholder?: "blur" | "empty" | `data:image/${string}`;
  blurDataURL?: string;
  unoptimized?: boolean;
  overrideSrc?: string;
  onLoadingComplete?: (img: HTMLImageElement) => void;
}

function resolveStaticImport(src: string | StaticImport): {
  url: string;
  width?: number;
  height?: number;
} {
  if (typeof src === "string") return { url: src };
  const data = "default" in src ? src.default : src;
  return { url: data.src, width: data.width, height: data.height };
}

const FILL_STYLE: CSSProperties = {
  position: "absolute",
  height: "100%",
  width: "100%",
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
};

const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  {
    src,
    alt,
    width,
    height,
    fill = false,
    loader,
    quality: _quality,
    priority = false,
    placeholder: _placeholder,
    blurDataURL: _blurDataURL,
    unoptimized: _unoptimized,
    overrideSrc,
    onLoadingComplete,
    loading,
    style,
    decoding,
    onLoad,
    ...rest
  },
  ref,
) {
  const resolved = resolveStaticImport(src);
  const url =
    overrideSrc ??
    (loader
      ? loader({
          src: resolved.url,
          width: Number(width ?? resolved.width ?? 0),
          quality: _quality === undefined ? undefined : Number(_quality),
        })
      : resolved.url);

  const finalWidth = fill ? undefined : (width ?? resolved.width);
  const finalHeight = fill ? undefined : (height ?? resolved.height);

  return (
    <img
      ref={ref}
      src={url}
      alt={alt}
      width={finalWidth}
      height={finalHeight}
      decoding={decoding ?? "async"}
      loading={loading ?? (priority ? "eager" : "lazy")}
      fetchPriority={priority ? "high" : undefined}
      style={fill ? { ...FILL_STYLE, ...style } : style}
      onLoad={(event) => {
        onLoadingComplete?.(event.currentTarget);
        onLoad?.(event);
      }}
      {...rest}
    />
  );
});

export default Image;
