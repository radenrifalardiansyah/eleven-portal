import * as XLSX from "xlsx";

const HEADER_STYLE = {
  font: { bold: true, color: { rgb: "FFFFFF" } },
  fill: { patternType: "solid", fgColor: { rgb: "0053FF" } },
  alignment: { vertical: "center", horizontal: "left" },
};

const NOTE_STYLE = {
  font: { italic: true, color: { rgb: "6B7280" } },
};

function autoSizeColumns(headers: string[], rows: Record<string, unknown>[]) {
  return headers.map((header) => {
    const longestValue = rows.reduce((max, row) => {
      const value = row[header];
      const len = value == null ? 0 : String(value).length;
      return Math.max(max, len);
    }, header.length);
    return { wch: Math.min(Math.max(longestValue + 2, 12), 60) };
  });
}

function styleHeaderRow(worksheet: XLSX.WorkSheet, headerCount: number) {
  for (let col = 0; col < headerCount; col++) {
    const ref = XLSX.utils.encode_cell({ r: 0, c: col });
    if (worksheet[ref]) worksheet[ref].s = HEADER_STYLE;
  }
}

/** Exports rows as a tidy single-sheet workbook: bold colored header row and
 *  auto-sized columns instead of the raw unstyled default SheetJS output. */
export function exportRowsToExcel(rows: Record<string, unknown>[], filename: string, sheetName = "Data") {
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = autoSizeColumns(headers, rows);
  worksheet["!rows"] = [{ hpt: 20 }];
  styleHeaderRow(worksheet, headers.length);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`, { cellStyles: true });
}

export async function parseExcelFile(file: File): Promise<Record<string, string>[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
}

export type TemplateColumn = {
  header: string;
  example: string;
  note: string;
};

/** Builds a downloadable import template with two sheets: a "Template" sheet
 *  pre-filled with example rows ready to edit, and a "Petunjuk" sheet explaining
 *  each column and how to upload the file back through the Import button. */
export function exportImportTemplate(filename: string, columns: TemplateColumn[], exampleRows: Record<string, unknown>[]) {
  const headers = columns.map((c) => c.header);

  const templateSheet = XLSX.utils.json_to_sheet(exampleRows, { header: headers });
  templateSheet["!cols"] = autoSizeColumns(headers, exampleRows);
  templateSheet["!rows"] = [{ hpt: 20 }];
  styleHeaderRow(templateSheet, headers.length);

  const instructionRows = [
    { Kolom: "Cara Upload", Keterangan: "1. Isi data pada sheet \"Template\" mengikuti contoh baris pertama." },
    { Kolom: "", Keterangan: "2. Jangan mengubah nama kolom (baris pertama sheet Template)." },
    { Kolom: "", Keterangan: "3. Simpan file, lalu klik tombol Import di halaman admin dan pilih file ini." },
    { Kolom: "", Keterangan: "4. Baris dengan Slug atau Nama kosong akan dilewati saat import." },
    { Kolom: "", Keterangan: "" },
    { Kolom: "Penjelasan Kolom", Keterangan: "" },
    ...columns.map((c) => ({ Kolom: c.header, Keterangan: c.note })),
  ];
  const instructionSheet = XLSX.utils.json_to_sheet(instructionRows, { header: ["Kolom", "Keterangan"] });
  instructionSheet["!cols"] = [{ wch: 20 }, { wch: 80 }];
  styleHeaderRow(instructionSheet, 2);
  for (let r = 1; r <= 4; r++) {
    const ref = XLSX.utils.encode_cell({ r, c: 1 });
    if (instructionSheet[ref]) instructionSheet[ref].s = NOTE_STYLE;
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, templateSheet, "Template");
  XLSX.utils.book_append_sheet(workbook, instructionSheet, "Petunjuk");
  XLSX.writeFile(workbook, `${filename}.xlsx`, { cellStyles: true });
}
