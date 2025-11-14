/* eslint-disable @typescript-eslint/no-explicit-any */
import Papa from 'papaparse';
import { ICSVServices } from '../../application/interfaces/ICSVService';

export class CSVServices implements ICSVServices {
  // Parsea un archivo CSV y lo convierte en un array de objetos JSON
  async parseCSVToJson(buffer: Buffer): Promise<any[]> {
    const csvString = buffer.toString('utf8');

    return new Promise((resolve, reject) => {
      (Papa.parse as any)(csvString, {
        header: true,
        skipEmptyLines: true,
        trimHeaders: true,
        dynamicTyping: true,
        complete: (results: Papa.ParseResult<any>) => {
          if (results.errors && results.errors.length > 0) {
            console.warn('[CSVServices] Parse warnings:', results.errors);
          }
          resolve(results.data);
        },
        error: (error: Papa.ParseError) => {
          reject(new Error(`CSV parsing error: ${error.message || error}`));
        },
      });
    });
  }
}
