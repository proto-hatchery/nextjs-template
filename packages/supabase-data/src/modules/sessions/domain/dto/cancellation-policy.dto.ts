export interface CancellationPolicyOptionDTO {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly feePercentage: number;
  readonly minNoticeHours: number;
}

export interface PsychologistCancellationPolicyDTO {
  readonly policyCode: string;
  readonly effectiveFrom: string | null;
  readonly effectiveUntil: string | null;
}

export interface EffectiveCancellationPolicyDTO extends PsychologistCancellationPolicyDTO {
  readonly feePercentage: number;
  readonly minNoticeHours: number;
}

export interface CancellationFeeDTO {
  readonly feePercentage: number;
  readonly minNoticeHours: number;
  readonly hoursBeforeSession: number;
  readonly policyApplies: boolean;
}
