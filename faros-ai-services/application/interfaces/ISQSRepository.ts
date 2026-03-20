export interface ISQSRepository {
  /**
   * Sends a message to the Word Cloud processing SQS queue.
   */
  sendMessage(messageBody: string): Promise<void>;
}
