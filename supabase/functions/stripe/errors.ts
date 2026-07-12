export class StripeFunctionError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = "StripeFunctionError"
  }
}
