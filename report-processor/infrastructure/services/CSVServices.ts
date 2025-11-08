import ExcelJS from 'exceljs';

export class CSVServices {
  // Parsea un archivo CSV y lo convierte en un array de objetos JSON
  async parseCSVToJson(buffer: Buffer): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.csv.read(buffer);
    const worksheet = workbook.worksheets[0];
    const rows: any[] = [];

    // Asume que la primera fila es el header
    const headers = worksheet.getRow(1).values as string[];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const obj: any = {};
      row.values.forEach((value, idx) => {
        if (headers[idx]) obj[headers[idx]] = value;
      });
      rows.push(obj);
    });

    return rows;
  }
}
