import type { Metadata } from "next";
import ClientDataPageContent from "@/views/demos/client-data/PageContent";

export const metadata: Metadata = {
  title: "Client Data",
  description: "Client-side data fetching",
};

export default function ClientDataPage() {
  return <ClientDataPageContent />;
}
