import type React from "react";

export interface ToastProviderProps {
  children: React.ReactNode;
}

export interface ToastProps extends React.ComponentPropsWithoutRef<"div"> {
  id: string;
  className?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export interface ToastTitleProps extends React.ComponentPropsWithoutRef<"div"> {
  className?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export interface ToastDescriptionProps extends React.ComponentPropsWithoutRef<"div"> {
  className?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export interface ToastCloseProps extends React.ComponentPropsWithoutRef<"button"> {
  className?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}

export interface ToastViewportProps extends React.ComponentPropsWithoutRef<"div"> {
  className?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
}
