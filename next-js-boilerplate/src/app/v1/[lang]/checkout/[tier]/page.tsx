import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutContent from "@/views/checkout/CheckoutContent";
import type { CheckoutContentPageProps } from "@/types/checkout/CheckoutPage-types";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your purchase",
};

export default function CheckoutPage({ params }: CheckoutContentPageProps) {
  return (
    <Suspense>
      <CheckoutContent params={params} />
    </Suspense>
  );
}
