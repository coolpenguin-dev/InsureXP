import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { Parser } from 'json2csv';

/**
 * Export helpers wired for invoices / reports (implement row shaping per feature).
 */
@Injectable()
export class ReportsService {
  async buildInvoicePdfBuffer(_title: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ margin: 50 });
      doc.on('data', (c) => chunks.push(c as Buffer));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.fontSize(18).text('InsureXP', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text('Invoice PDF scaffold — replace with bill line items.');
      doc.end();
    });
  }

  async buildWorkbookBuffer(_sheetName: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(_sheetName || 'Export');
    sheet.addRow(['InsureXP', 'Excel export scaffold']);
    const buf = await workbook.xlsx.writeBuffer();
    return Buffer.from(buf);
  }

  buildCsv(rows: Record<string, unknown>[]): string {
    if (!rows.length) {
      return '';
    }
    const parser = new Parser({ fields: Object.keys(rows[0] ?? {}) });
    return parser.parse(rows);
  }
}
