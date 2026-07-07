"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { plansPath } from "@/constants/routes";
import { readLangCookie } from "@/lib/read-lang-cookie";

export default function PricingPage() {
  const router = useRouter();

  useEffect(() => {
    const lang = readLangCookie();
    router.replace(plansPath(lang));
  }, [router]);

  return null;
}
