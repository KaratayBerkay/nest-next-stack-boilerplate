"use client";
import { forwardRef } from "react";
import { Root, Trigger, Portal, Overlay, Content, Title, Description, Cancel, Action } from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/cn";

export const AlertDialog = Root;
export const AlertDialogTrigger = Trigger;
export const AlertDialogCancel = Cancel;
export const AlertDialogAction = Action;
export const AlertDialogHeader = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(({ className, ...props }, ref) => <div ref={ref} className={cn("flex flex-col gap-1 text-center sm:text-left", className)} {...props} />);
AlertDialogHeader.displayName = "AlertDialogHeader";
export const AlertDialogFooter = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(({ className, ...props }, ref) => <div ref={ref} className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2", className)} {...props} />);
AlertDialogFooter.displayName = "AlertDialogFooter";

export const AlertDialogContent = forwardRef<React.ElementRef<typeof Content>, React.ComponentPropsWithoutRef<typeof Content>>(({ className, ...props }, ref) => (
  <Portal>
    <Overlay className="bg-black/50 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out fixed inset-0 z-50" />
    <Content ref={ref} className={cn("bg-bg border-border data-[state=open]:animate-fade-in-up data-[state=closed]:animate-fade-out fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg", className)} {...props} />
  </Portal>
));
AlertDialogContent.displayName = "AlertDialogContent";

export const AlertDialogTitle = forwardRef<React.ElementRef<typeof Title>, React.ComponentPropsWithoutRef<typeof Title>>(({ className, ...props }, ref) => <Title ref={ref} className={cn("text-lg font-semibold", className)} {...props} />);
AlertDialogTitle.displayName = "AlertDialogTitle";

export const AlertDialogDescription = forwardRef<React.ElementRef<typeof Description>, React.ComponentPropsWithoutRef<typeof Description>>(({ className, ...props }, ref) => <Description ref={ref} className={cn("text-muted text-sm", className)} {...props} />);
AlertDialogDescription.displayName = "AlertDialogDescription";
