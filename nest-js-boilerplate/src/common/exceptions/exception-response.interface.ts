import type { ExceptionCode } from './exception-code';

export type ExceptionFieldError = {
  field: string;
  msg: string;
  key: string;
};

export type ExceptionResponse = {
  statusCode: number;
  exc: ExceptionCode;
  msg: string;
  key: string;
  field?: string;
  fields?: ExceptionFieldError[];
};
