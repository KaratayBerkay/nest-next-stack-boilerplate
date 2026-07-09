import type { Metadata } from "next";
import CsrPageContent from "@/views/demos/csr/PageContent";

export const metadata: Metadata = {
  title: "CSR",
  description: "Client-side rendering demo",
};

export default function CsrPage() {
  return <CsrPageContent />;
}
