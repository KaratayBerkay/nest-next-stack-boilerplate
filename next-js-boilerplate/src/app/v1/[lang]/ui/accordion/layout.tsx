import AccordionLayout from "@/views/ui/accordion/AccordionLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AccordionLayout>{children}</AccordionLayout>;
}
