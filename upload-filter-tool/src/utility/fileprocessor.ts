import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const processFiles = (
  files: File[],
  onFileProcessed: (data: any[]) => void
) => {
  files.forEach((file) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = e.target?.result;

      if (
        file.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.name.endsWith('.xlsx')
      ) {
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
        const textData = data?.toString() || '';
        const lines = textData.split('\n').map((line) => line.trim());
        const formattedData = lines.map((line, index) => ({
          Line: index + 1,
          Content: line,
        }));

        onFileProcessed(formattedData);
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
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
  // Read the file as an ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Use the ArrayBuffer with getDocument
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];

  const accountInfo = {};
  const transactions = [];

  const groupWordsIntoLines = (items: any[]) => {
    const lines: string[] = [];
    let currentLine: string[] = [];
    let currentY = items[0].transform[5];  // Starting y-coordinate of the first word

    items.forEach((item) => {
      const word = item.str.trim();
      const y = item.transform[5];

      // Check if this word is in the same line (based on y-coordinate)
      if (Math.abs(y - currentY) < 5) {
        currentLine.push(word);
      } else {
        lines.push(currentLine.join(' '));
        currentLine = [word];
        currentY = y;
      }
    });

    // Push the last line
    if (currentLine.length > 0) {
      lines.push(currentLine.join(' '));
    }
    return lines;
  };

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    const lines = groupWordsIntoLines(textContent.items);
    
    lines.forEach((line: string) => {
      // Check for account info based on keywords
      if (line.includes('Дансны дугаар')) {
        accountInfo.AccountNumber = line.split(':')[1]?.trim();
      }
      if (line.includes('Эзэмшигчийн нэр')) {
        accountInfo.AccountHolder = line.split(':')[1]?.trim();
      }
      if (line.includes('Валют')) {
        accountInfo.Currency = line.split(':')[1]?.trim();
      }

      // Extract transactions (e.g., using regex for dates, amounts)
      const datePattern = /\d{1,2}\/\d{1,2}\/\d{4}/;  // Match date format
      const amountPattern = /\d+([,\.]\d{1,2})?/;   // Match amount (with optional decimal)

      if (datePattern.test(line)) {
        const date = line.match(datePattern)?.[0];
        const amount = line.match(amountPattern)?.[0];

        if (date && amount) {
          transactions.push({
            Date: date,
            Amount: amount,
            Description: line
          });
        }
      }
    });

 /*    
    textContent.items.forEach((item: any) =>{
      const text = item.str.trim();

      if(text.includes('Дансны дугаар')){
        console.log('Дансны дугаар*****')
      }
    }) */
    /* const pageText = textContent.items.map((item) => item.str).join(' '); */



    //console.log(pageText)

    //pages.push({ Page: i, Content: pageText });
  }

  pages.push({
    Transactions: transactions
  });
  
  return pages;
};
