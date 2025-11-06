export type Envelope<T = unknown> = {
  type: string;
  version?: string;
  payload: T;
};

// Payloads por tipo:
export type GenerateLiquidacionPayload = {
  id: string;
  email?: string;
  s3Key?: string;
};
