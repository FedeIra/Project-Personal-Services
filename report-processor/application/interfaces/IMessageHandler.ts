// SQS Message Handler Interface:
export interface IMessageHandler<T = unknown> {
  readonly type: string;
  handle(payload: T): Promise<void>;
}
