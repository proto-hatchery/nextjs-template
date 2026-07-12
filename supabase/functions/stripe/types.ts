export type StripeAction = "checkout"

export interface CheckoutPayload {
  cancelUrl: string
  priceId: string
  successUrl: string
}

export interface StripeRequest {
  action: StripeAction
  payload: CheckoutPayload
}

export interface StripeResponse {
  url: string
}
