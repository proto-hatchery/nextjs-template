import type { SupabaseClient } from "@supabase/supabase-js";
import { err, ok, type Result } from "neverthrow";
import { AppError, AppErrorCode } from "../../../../lib/errors/app-error";
import type { Database } from "@workspace/supabase-infra/types/database";
import type {
  ActivitiesPaginationInputDTO,
  AllCatalogsDTO,
  ReferenceCategoryDTO,
} from "../../domain/dto/reference-value.dto";
import type { CatalogRepository } from "../../domain/ports/catalog-repository.port";
import {
  mapActivityReference,
  mapApproachReference,
  mapCancellationPolicyReference,
  mapServiceReference,
  mapSpecialtyReference,
} from "../mappers/reference-value.mapper";

type ReferenceValueRow = Database["public"]["Tables"]["reference_values"]["Row"];

const REFERENCE_CATEGORIES: Record<ReferenceCategoryDTO, ReferenceCategoryDTO> = {
  psychological_service_type: "psychological_service_type",
  specialty: "specialty",
  approach: "approach",
  cancellation_policy: "cancellation_policy",
};

export class CatalogSupabaseRepository implements CatalogRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  private async fetchReferenceValues(
    category: ReferenceCategoryDTO,
  ): Promise<Result<readonly ReferenceValueRow[], AppError>> {
    const { data, error } = await this.supabase
      .from("reference_values")
      .select("*")
      .eq("category", REFERENCE_CATEGORIES[category])
      .eq("is_active", true)
      .order("label_pt", { ascending: true });

    if (error) {
      return err(
        AppError.infra(
          AppErrorCode.INFRA_SUPABASE,
          "Failed to fetch catalog reference values",
          error,
        ),
      );
    }

    return ok(data ?? []);
  }

  async getServices() {
    const rowsResult = await this.fetchReferenceValues("psychological_service_type");
    if (rowsResult.isErr()) {
      return err(rowsResult.error);
    }
    return ok(rowsResult.value.map(mapServiceReference));
  }

  async getSpecialties() {
    const rowsResult = await this.fetchReferenceValues("specialty");
    if (rowsResult.isErr()) {
      return err(rowsResult.error);
    }
    return ok(rowsResult.value.map(mapSpecialtyReference));
  }

  async getApproaches() {
    const rowsResult = await this.fetchReferenceValues("approach");
    if (rowsResult.isErr()) {
      return err(rowsResult.error);
    }
    return ok(rowsResult.value.map(mapApproachReference));
  }

  async getCancellationPolicies() {
    const rowsResult = await this.fetchReferenceValues("cancellation_policy");
    if (rowsResult.isErr()) {
      return err(rowsResult.error);
    }
    return ok(rowsResult.value.map(mapCancellationPolicyReference));
  }

  async getActivities(
    pagination?: ActivitiesPaginationInputDTO,
  ): Promise<Result<AllCatalogsDTO["activities"], AppError>> {
    let query = this.supabase
      .from("catalog_clinical_activities")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true });

    const hasPagination = pagination?.page !== undefined || pagination?.pageSize !== undefined;
    if (hasPagination) {
      const page = pagination?.page ?? 0;
      const pageSize = pagination?.pageSize ?? 12;
      const from = page * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;

    if (error) {
      return err(
        AppError.infra(AppErrorCode.INFRA_SUPABASE, "Failed to fetch catalog activities", error),
      );
    }

    return ok((data ?? []).map(mapActivityReference));
  }

  async getAllCatalogs(): Promise<Result<AllCatalogsDTO, AppError>> {
    const [
      servicesResult,
      specialtiesResult,
      approachesResult,
      cancellationPoliciesResult,
      activitiesResult,
    ] = await Promise.all([
      this.getServices(),
      this.getSpecialties(),
      this.getApproaches(),
      this.getCancellationPolicies(),
      this.getActivities(),
    ]);

    if (servicesResult.isErr()) {
      return err(servicesResult.error);
    }
    if (specialtiesResult.isErr()) {
      return err(specialtiesResult.error);
    }
    if (approachesResult.isErr()) {
      return err(approachesResult.error);
    }
    if (cancellationPoliciesResult.isErr()) {
      return err(cancellationPoliciesResult.error);
    }
    if (activitiesResult.isErr()) {
      return err(activitiesResult.error);
    }

    return ok({
      services: servicesResult.value,
      specialties: specialtiesResult.value,
      approaches: approachesResult.value,
      cancellationPolicies: cancellationPoliciesResult.value,
      activities: activitiesResult.value,
    });
  }
}
