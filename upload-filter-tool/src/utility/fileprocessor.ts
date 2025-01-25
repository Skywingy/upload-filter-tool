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
        console.log('excelData', formattedData);

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
        console.log('pdfData------------', pdfData)
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
const parsePdfContent = async (lines: { y: number; x: number; text: string }[]) => {
  const accountInfo: any = {};
  const transactions: any[] = [];

  console.log('----------', lines)
  lines.forEach(({ y, x, text }) => {
    // Header section or account details
    if (y > 428 && y < 525) {
      //console.log('Header Section:', text);
    }
    // Transaction rows 1. Date
    else if (x > 37.1 && x < 39.15) {
      //console.log('Dates:', text)  
    }
    //2. Teller
    else if(x > 103.5 && x < 118){
      //console.log('Teller', text)
    }
    //3. Branch
    else if(x > 164 && x < 176){
    console.log('branch', text)
    }
    //4. Transaction number
    else if(x == 255.42){
      //console.log('Tran number', text)
    }
    //5. Transaction description
    else if(x > 337  && x < 390){
      //console.log('tran desc', text)
    }
    //6. Income
    else if(x == 461.664 || x == 450.961){
      //console.log(text)
    }
    //7. Expense
    else if(x == 498.878 || x == 505.689 || x == 501.797){
      console.log('expense', text)
    }
    //8. Rate
    else if(x == 552.279){
      console.log(text)
    }
    //9. Balance
    else if(x > 582 && x < 583.4){
      console.log('Balance', text)
    }
    //10. Transacted bank
    else if(x > 638 && x < 644){
      console.log('tran bank', text)
    }
    //11. Transacted account type
    else if(x == 713.7 || x == 706.686 || x == 700.848){
      console.log('type', text)
    }
    //12. Transacted account name
    else if(x == 794.05 || x == 770 || x == 839){
      console.log('Tran name', text)
    }
    //13. Journal number
    else if(x == 858.034){
      console.log('Journal number', text)
    }
  });
  
  console.log('eeee', accountInfo)
  return { AccountInfo: accountInfo, Transactions: transactions };
};




const readPdf = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const lines: { y: number; x: number; text: string }[] = []; // This will hold grouped lines with x and y coordinates

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Group words into lines and append to lines array
    const groupedLines = groupWordsIntoLines(textContent.items);
    lines.push(...groupedLines);
  }

  return parsePdfContent(lines); // Pass lines with x and y to parsePdfContent
};




const groupWordsIntoLines = (items: any[]) => {
  const lines: { y: number; x: number; text: string }[] = [];
  let currentLine: { x: number; text: string[] }[] = [];
  let currentY = items[0].transform[5]; // Initial y-coordinate

  items.forEach((item) => {
    const word = item.str.trim();
    const x = item.transform[4]; // X-coordinate of the word
    const y = item.transform[5]; // Y-coordinate of the word

    if (Math.abs(y - currentY) < 5) {
      // Same row, check for column alignment
      const column = currentLine.find((line) => Math.abs(line.x - x) < 5);
      if (column) {
        column.text.push(word); // Add to the same column
      } else {
        currentLine.push({ x, text: [word] }); // Create a new column
      }
    } else {
      // New row
      currentLine.forEach((line) =>
        lines.push({ y: currentY, x: line.x, text: line.text.join(" ") })
      );
      currentLine = [{ x, text: [word] }]; // Start a new row
      currentY = y; // Update the y-coordinate
    }
  });

  // Push the last row
  if (currentLine.length > 0) {
    currentLine.forEach((line) =>
      lines.push({ y: currentY, x: line.x, text: line.text.join(" ") })
    );
  }

  return lines;
};
