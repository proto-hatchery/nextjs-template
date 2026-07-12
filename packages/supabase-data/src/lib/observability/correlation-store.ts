import { AsyncLocalStorage } from "node:async_hooks";

export type CorrelationContext = {
  correlationId: string;
  traceId: string;
};

const asyncStorage: AsyncLocalStorage<CorrelationContext> | undefined = (() => {
  try {
    return new AsyncLocalStorage<CorrelationContext>();
  } catch {
    return undefined;
  }
})();

export function isAgentHarnessEnabled(): boolean {
  const value = process.env.AGENT_HARNESS_ENABLE;
  if (!value) return false;
  return value === "1" || value.toLowerCase() === "true";
}

export const CorrelationStore = {
  run<T>(context: CorrelationContext, fn: () => T): T {
    if (!asyncStorage) return fn();
    return asyncStorage.run(context, fn);
  },
};

export function getCorrelationContext(): CorrelationContext | undefined {
  if (!asyncStorage) return undefined;
  return asyncStorage.getStore();
}
