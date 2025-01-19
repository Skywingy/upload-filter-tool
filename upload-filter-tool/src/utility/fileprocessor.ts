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
const parsePdfContent = async (pdfContent: string[]) => {
  const accountInfo: any = {};
  const transactions: any[] = [];

  // Extract Account Information
  pdfContent.forEach((line) => {
    //1st line
    if (/Дансн\s*эзэмшигчийн\s*нэр/.test(line)) {
      const match = line.match(/Дансн\s*эзэмшигчийн\s*нэр\s*:\s*(.+?)\s*Данс\s*нээсэн\s*огноо\s*:\s*(\d{4}\/\d{2}\/\d{2})/);
      if (match) {
        accountInfo.AccountHolder = match[1]?.trim();
        accountInfo.CreatedDate = match[2]?.trim();
      }
    }
    //2nd line
    if (/Дансны\s*дугаар/.test(line)) {
      const match = line.match(/Дансны\s*дугаар\s*:\s*(\d+).*Дуусах\s*хугацаа\s*:\s*(\S+)/);
      if (match) {
        accountInfo.AccountNumber = match[1]?.trim(); 
        accountInfo.ExpireDate = match[2]?.trim();
      }
    }
    //3rd line
    if (/Регистрийн\s*дугаар/.test(line)) {
      const match = line.match(/Регистрийн\s*дугаар\s*:\s*(\d+).*Валют\s*:\s*(\S+)/);
      if (match) {
        accountInfo.Id = match[1]?.trim(); 
        accountInfo.Currency = match[2]?.trim();
      }
    }
    //4th line
    if (/Дансны\s*төрөл/.test(line)) {  
      const match = line.match(/Дансны\s*төрөл\s*:\s*(.+?)\s*Хүү\s*:\s*(.+)/);
      if (match) {
        accountInfo.AccountType = match[1]?.trim(); // Extract account type
        accountInfo.InterestRate = match[2]?.trim(); // Extract interest rate
      }
    }
    //5th line
    if (/Хугацаа\s*:\s*(\d{4}\/\d{2}\/\d{2})\s*-\s*(\d{4}\/\d{2}\/\d{2})\s*Нийт\s*орлого\s*:\s*([\d,\.]+)/.test(line)) {
      const match = line.match(/Хугацаа\s*:\s*(\d{4}\/\d{2}\/\d{2})\s*-\s*(\d{4}\/\d{2}\/\d{2})\s*Нийт\s*орлого\s*:\s*([\d,\.]+)/);
      if (match) {
        accountInfo.StartDate = match[1]?.trim(); // Extract start date
        accountInfo.EndDate = match[2]?.trim();   // Extract end date
        accountInfo.TotalIncome = match[3]?.trim(); // Extract total income
      }
    }
    //6th line
    if (/Нийт\s*зарлага\s*:\s*([\d,\.]+)/.test(line)) {
      const match = line.match(/Нийт\s*зарлага\s*:\s*([\d,\.]+)/);
      if (match) {
        accountInfo.TotalExpenditure = match[1]?.trim(); // Extract total expenditure
      }
    }
  });

  // Extract Transactions
  const transactionRegex =
    /(\d{1,2}\/\d{1,2}\/\d{4}) (\d{1,2}:\d{2}:\d{2} (AM|PM))\s+(.*?)\s+([\d,.]+)\s+([\d,.]+)\s+([\d,.]+)\s+([\d,.]+)/;

  pdfContent.forEach((line) => {
    const match = line.match(transactionRegex);
    if (match) {
      transactions.push({
        Date: match[1],
        Time: match[2],
        Description: match[4],
        Income: match[5],
        Expense: match[6],
        ExchangeRate: match[7],
        Balance: match[8],
      });
    }
  });

  return {
    AccountInfo: accountInfo,
    Transactions: transactions,
  };
};


const readPdf = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const textLines: string[] = []; // This will hold grouped lines

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Group words into lines and append to textLines
    const lines = groupWordsIntoLines(textContent.items);
    textLines.push(...lines);
  }

  return parsePdfContent(textLines); // Pass lines to parsePdfContent
};


const groupWordsIntoLines = (items: any[]) => {
  const lines: string[] = [];
  let currentLine: string[] = [];
  let currentY = items[0].transform[5]; // Initial y-coordinate

  items.forEach((item) => {
    const word = item.str.trim();
    const y = item.transform[5]; // Y-coordinate of the word

    // If the current word is on the same line (similar y-coordinate)
    if (Math.abs(y - currentY) < 5) {
      currentLine.push(word); // Add word to the current line
    } else {
      lines.push(currentLine.join(' ')); // Push the completed line
      currentLine = [word]; // Start a new line
      currentY = y; // Update the y-coordinate
    }
  });

  // Push the last line
  if (currentLine.length > 0) {
    lines.push(currentLine.join(' '));
  }

  return lines;
};
