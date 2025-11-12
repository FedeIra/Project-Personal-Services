export type Envelope<T = unknown> = {
  version?: string;
  payload: T;
};

export type GenerateReport = {
  id: string;
  reportType: string;
};
