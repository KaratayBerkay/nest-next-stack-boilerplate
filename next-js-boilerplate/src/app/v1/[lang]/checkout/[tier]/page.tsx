import { Suspense } from "react";
import CheckoutContent from "./checkout-content";

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ lang: string; tier: string }>;
}) {
  return (
    <Suspense>
      <CheckoutContent params={params} />
    </Suspense>
  );
}
