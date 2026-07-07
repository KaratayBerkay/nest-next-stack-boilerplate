import { z } from "zod";
import { getToday } from "@/lib/date-time";

function luhnCheck(num: string): boolean {
  let sum = 0;
  let alternate = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

export function mockCardFormSchema(errors: {
  cardNumberRequired: string;
  cardNumberInvalid: string;
  expiryRequired: string;
  expiryInvalid: string;
  expiryPast: string;
  cvcRequired: string;
  cvcInvalid: string;
  nameRequired: string;
}) {
  return z
    .object({
      cardNumber: z
        .string()
        .min(1, errors.cardNumberRequired)
        .refine((v) => /^\d{13,19}$/.test(v.replace(/\s/g, "")), errors.cardNumberInvalid)
        .refine((v) => luhnCheck(v.replace(/\s/g, "")), errors.cardNumberInvalid),
      expMonth: z
        .string()
        .min(1, errors.expiryRequired)
        .refine((v) => /^(0?[1-9]|1[0-2])$/.test(v), errors.expiryInvalid),
      expYear: z
        .string()
        .min(1, errors.expiryRequired)
        .refine((v) => /^\d{2}$/.test(v), errors.expiryInvalid),
      cvc: z
        .string()
        .min(1, errors.cvcRequired)
        .refine((v) => /^\d{3,4}$/.test(v), errors.cvcInvalid),
      cardholderName: z.string().min(1, errors.nameRequired),
    })
    .refine(
      (v) => {
        const month = parseInt(v.expMonth, 10);
        const year = parseInt(v.expYear, 10);
        if (isNaN(month) || isNaN(year)) return false;
        const currentYear = (getToday("year") as number) % 100;
        const currentMonth = getToday("month") as number;
        if (year < currentYear) return false;
        if (year === currentYear && month < currentMonth) return false;
        return month >= 1 && month <= 12;
      },
      { message: errors.expiryPast },
    );
}

export type MockCardFormData = z.infer<ReturnType<typeof mockCardFormSchema>>;

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function getLast4(cardNumber: string): string {
  return cardNumber.replace(/\s/g, "").slice(-4);
}
