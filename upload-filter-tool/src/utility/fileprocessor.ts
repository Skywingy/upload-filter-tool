import * as XLSX from 'xlsx';
import { getDocument } from 'pdfjs-dist';

export const processFiles = (
  files: File[],
  onFileProcessed: (data: any[]) => void
) => {
  files.forEach((file) => {
    console.log('')
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = e.target?.result;

      if (
        file.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.name.endsWith('.xlsx')
      ) {
        console.log('excel here')
        // Process Excel files
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: '',
        });
        const headers = jsonData[0];
        const rows = jsonData.slice(1);

        const formattedData = rows.map((row) =>
          headers.reduce(
            (acc, header, index) => ({
              ...acc,
              [header]: row[index] || '',
            }),
            {}
          )
        );

        onFileProcessed(formattedData);
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        // Process Text files
        console.log('text')
        const textData = data?.toString() || '';
        const lines = textData.split('\n').map((line) => line.trim());
        const formattedData = lines.map((line, index) => ({
          Line: index + 1,
          Content: line,
        }));

        onFileProcessed(formattedData);
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        console.log('pdf working')
        // Process PDF files
        const pdfData = await readPdf(file);
        onFileProcessed(pdfData);
      }
    };

    if (
      file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.name.endsWith('.xlsx')
    ) {
      reader.readAsBinaryString(file);
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      reader.readAsArrayBuffer(file);
    }
  });
};

// Helper function to read and process PDFs
const readPdf = async (file: File) => {
  const pdf = await getDocument({ data: file }).promise;
  const pages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(' ');

    pages.push({ Page: i, Content: pageText });
  }

  return pages;
};
