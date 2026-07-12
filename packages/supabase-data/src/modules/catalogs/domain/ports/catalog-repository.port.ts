import type { Result } from "neverthrow";
import type { AppError } from "../../../../lib/errors/app-error";
import type {
  ActivityReferenceDTO,
  AllCatalogsDTO,
  ActivitiesPaginationInputDTO,
  ApproachReferenceDTO,
  CancellationPolicyReferenceDTO,
  ServiceReferenceDTO,
  SpecialtyReferenceDTO,
} from "../dto/reference-value.dto";

export interface CatalogRepository {
  getServices(): Promise<Result<readonly ServiceReferenceDTO[], AppError>>;
  getSpecialties(): Promise<Result<readonly SpecialtyReferenceDTO[], AppError>>;
  getApproaches(): Promise<Result<readonly ApproachReferenceDTO[], AppError>>;
  getCancellationPolicies(): Promise<Result<readonly CancellationPolicyReferenceDTO[], AppError>>;
  getActivities(
    pagination?: ActivitiesPaginationInputDTO,
  ): Promise<Result<readonly ActivityReferenceDTO[], AppError>>;
  getAllCatalogs(): Promise<Result<AllCatalogsDTO, AppError>>;
}
