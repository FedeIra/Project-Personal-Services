// Interface for CSV service operations:
export interface ICSVServices {
  parseCSVToJson(buffer: Buffer): Promise<any[]>;
}
