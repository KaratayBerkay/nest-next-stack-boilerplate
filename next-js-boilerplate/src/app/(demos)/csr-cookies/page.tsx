import type { Metadata } from "next";
import CsrCookiesPageContent from "@/views/demos/csr-cookies/PageContent";

export const metadata: Metadata = {
  title: "CSR Cookies",
  description: "Client-side rendering with cookies",
};

export default function CsrCookiesPage() {
  return <CsrCookiesPageContent />;
}
