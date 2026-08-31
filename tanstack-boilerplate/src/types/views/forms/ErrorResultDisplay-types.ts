import type { ExceptionResponse } from "@/lib/api-client";
import type { ClientException } from "@/lib/exception-handler";

export interface ErrorResultDisplayProps {
  result: ExceptionResponse | ClientException | null;
  label: string;
}
