import {
  AppError,
  AppErrorCode,
  isAppError,
  toAppError,
  assertNever,
  type AppErrorCodeType,
  type ValidationError,
  type AuthError,
  type NotFoundError,
  type ConflictError,
  type InfraError,
} from "./app-error";
import { mapAppErrorToHttp, type HttpErrorResponse } from "./http-mapper";
import { formatZodError, isZodError, toAppErrorWithZod } from "./zod-formatter";
import { logInfraError, logUnexpectedError, type ErrorContext } from "./observability";

export {
  AppError,
  AppErrorCode,
  isAppError,
  toAppError,
  assertNever,
  mapAppErrorToHttp,
  formatZodError,
  isZodError,
  toAppErrorWithZod,
  logInfraError,
  logUnexpectedError,
};
export type {
  AppErrorCodeType,
  ValidationError,
  AuthError,
  NotFoundError,
  ConflictError,
  InfraError,
  HttpErrorResponse,
  ErrorContext,
};
