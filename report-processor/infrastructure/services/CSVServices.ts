import Papa, { ParseResult, ParseConfig } from 'papaparse';
import { ICSVServices } from '../../application/interfaces/ICSVService';
import { ProcessedCSVData } from '../../types/types';

export class CSVServices implements ICSVServices {
  private readonly conceptMapping: Record<string, keyof ProcessedCSVData> = {
    'Remuneración Bruta': 'grossSalary',
    'Mejor remuneración mensual, normal y habitual Bruta': 'bestMonthlySalary',
    'Fecha de ingreso': 'startDate',
    'Fecha de egreso': 'endDate',
  };

  async parseCSVToJson(buffer: Buffer): Promise<ProcessedCSVData> {
    const csvString: string = buffer.toString('latin1');

    return new Promise((resolve, reject) => {
      const config: ParseConfig<string[]> = {
        header: false,
        skipEmptyLines: true,
        delimiter: ';',
        complete: (results: ParseResult<string[]>) => {
          try {
            if (results.errors && results.errors.length > 0) {
              console.warn('[CSVServices] Parse warnings:', results.errors);
            }
            const processedData = this.processTransposedCSV(results.data);
            resolve(processedData);
          } catch (error) {
            reject(error as Error);
          }
        },
      };
      Papa.parse<string[]>(csvString, config);
    });
  }

  private processTransposedCSV(rawData: string[][]): ProcessedCSVData {
    const result: Partial<ProcessedCSVData> = {};

    for (const row of rawData) {
      if (row.length >= 2 && row[0] && row[1]) {
        const concept = String(row[0]).trim();
        const value = this.parseValue(String(row[1]).trim());

        const mappedKey: string = this.conceptMapping[concept];

        if (mappedKey) {
          (result as Record<string, number | string>)[mappedKey] = value;
        }
      }
    }
    return result as ProcessedCSVData;
  }

  private parseValue(value: string): number | string {
    const trimmedValue = value.trim();

    const stringValue: string = trimmedValue
      .replace(/[$\s]/g, '')
      .replace(/\./g, '')
      .replace(/,/g, '.');

    if (!isNaN(Number(stringValue)) && stringValue !== '') {
      const numericValue = Number(stringValue);
      return numericValue;
    }

    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const matchDate = trimmedValue.match(dateRegex);

    if (matchDate) {
      const [, day, month, year] = matchDate;
      const dateValue = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
      ).toISOString();

      return dateValue;
    }

    return stringValue;
  }
}
