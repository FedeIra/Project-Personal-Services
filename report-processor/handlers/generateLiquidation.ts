import { GenerateLiquidacionPayload } from '../types/types';

export interface HandlerContext {
  bucket: string;
  table: string;
}

export class GenerateLiquidacionHandler {
  public readonly type = 'GenerateLiquidacion' as const;

  constructor(private readonly ctx: HandlerContext) {}

  async handle(payload: GenerateLiquidacionPayload): Promise<void> {
    console.log('GenerateLiquidacionHandler called with payload:', payload);
  }
}
