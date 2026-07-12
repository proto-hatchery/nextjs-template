import type { Result } from "neverthrow";
import type { AppError } from "../../../../lib/errors/app-error";
import type {
  PsychologistDTO,
  PsychologistLocationDTO,
  PsychologistOnboardingStateDTO,
  PsychologistServiceWithReferenceDTO,
  UpdatePsychologistCredentialsDTO,
  UpdatePsychologistProfileDTO,
  UpsertPsychologistLocationDTO,
  UpsertPsychologistServiceDTO,
} from "../dto/psychologist.dto";

export interface PsychologistRepository {
  findById(psychologistId: string): Promise<Result<PsychologistDTO | null, AppError>>;
  findServices(
    psychologistId: string,
  ): Promise<Result<PsychologistServiceWithReferenceDTO[], AppError>>;
  findLocations(psychologistId: string): Promise<Result<PsychologistLocationDTO[], AppError>>;
  findOnboardingState(
    psychologistId: string,
  ): Promise<Result<PsychologistOnboardingStateDTO | null, AppError>>;
  updateProfile(
    psychologistId: string,
    input: UpdatePsychologistProfileDTO,
  ): Promise<Result<void, AppError>>;
  updateCredentials(
    psychologistId: string,
    input: UpdatePsychologistCredentialsDTO,
  ): Promise<Result<void, AppError>>;
  upsertService(
    psychologistId: string,
    input: UpsertPsychologistServiceDTO,
  ): Promise<Result<{ id: string }, AppError>>;
  deleteService(psychologistId: string, serviceId: string): Promise<Result<void, AppError>>;
  upsertLocation(
    psychologistId: string,
    input: UpsertPsychologistLocationDTO,
  ): Promise<Result<{ id: string }, AppError>>;
  deleteLocation(psychologistId: string, locationId: string): Promise<Result<void, AppError>>;
}
