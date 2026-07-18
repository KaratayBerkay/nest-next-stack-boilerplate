import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutContent from "@/views/checkout/CheckoutContent";
import type { CheckoutContentPageProps } from "@/types/checkout/CheckoutPage-types";
import { CheckoutLoadingFallback } from "@/fallbacks";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your purchase",
};

export default function CheckoutPage({ params }: CheckoutContentPageProps) {
  return (
    <Suspense fallback={<CheckoutLoadingFallback />}>
      <CheckoutContent params={params} />
    </Suspense>
  );
}
