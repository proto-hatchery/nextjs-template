import type { Result } from "neverthrow";
import type { AppError } from "../../../../lib/errors/app-error";
import type {
  AvailabilityExceptionDTO,
  WeeklyAvailabilityConfigDTO,
} from "../dto/availability.dto";
import type {
  CreateExceptionInput,
  SaveWeeklyAvailabilityConfigInput,
  UpdateExceptionInput,
} from "../../../../utils/validation-schemas";

export interface AvailabilityRepository {
  getWeeklyConfig(psychologistId: string): Promise<Result<WeeklyAvailabilityConfigDTO, AppError>>;
  listExceptions(
    psychologistId: string,
    options?: {
      fromDate?: string;
      limit?: number;
    },
  ): Promise<Result<readonly AvailabilityExceptionDTO[], AppError>>;
  getExceptionById(
    psychologistId: string,
    exceptionId: string,
  ): Promise<Result<AvailabilityExceptionDTO | null, AppError>>;
  saveWeeklyConfig(
    psychologistId: string,
    input: SaveWeeklyAvailabilityConfigInput,
  ): Promise<Result<void, AppError>>;
  createException(
    psychologistId: string,
    input: CreateExceptionInput,
  ): Promise<Result<{ id: string }, AppError>>;
  deleteException(psychologistId: string, exceptionId: string): Promise<Result<void, AppError>>;
  updateException(
    psychologistId: string,
    input: UpdateExceptionInput,
  ): Promise<Result<void, AppError>>;
}
