// External Dependencies:
import Papa, { ParseResult, ParseConfig } from 'papaparse';

// Internal Dependencies:
import { ICSVServices } from '../../application/interfaces/ICSVService';
import { EmploymentData } from '../../types/types';

// Service to handle CSV operations:
export class CSVServices implements ICSVServices {
  // Mapping of CSV concepts to Employment Data keys:
  private readonly conceptMapping: Record<string, keyof EmploymentData> = {
    'Remuneración Bruta': 'grossSalary',
    'Mejor remuneración mensual, normal y habitual Bruta': 'bestMonthlySalary',
    'Fecha de ingreso': 'startDate',
    'Fecha de egreso': 'endDate',
    'Preaviso?': 'priorNotice',
  };

  // Parse CSV buffer to EmploymentData JSON:
  async parseEmploymentCSVToJson(buffer: Buffer): Promise<EmploymentData> {
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
            const processedData: EmploymentData =
              this.transformRowsToEmploymentData(results.data);
            resolve(processedData);
          } catch (error) {
            reject(error as Error);
          }
        },
      };
      Papa.parse<string[]>(csvString, config);
    });
  }

  // Transform CSV rows to Employment Data object:
  private transformRowsToEmploymentData(rawData: string[][]): EmploymentData {
    const result: Partial<EmploymentData> = {};

    for (const row of rawData) {
      if (row.length >= 2 && row[0] && row[1]) {
        const concept = String(row[0]).trim();
        const value = this.parseValue(String(row[1]).trim());

        const mappedKey: string = this.conceptMapping[concept];

        if (mappedKey) {
          (result as Record<string, number | string | boolean>)[mappedKey] =
            value;
        }
      }
    }
    return result as EmploymentData;
  }

  // Parse individual CSV value:
  private parseValue(value: string): number | string | boolean {
    const trimmedValue = value.trim().toLowerCase();

    if (trimmedValue === 'si' || trimmedValue === 'sí') {
      return true;
    }
    if (trimmedValue === 'no') {
      return false;
    }

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
