import * as XLSX from 'xlsx';

export const processFiles = (
  files: File[],
  onFileProcessed: (data: any[]) => void
) => {
  files.forEach((file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
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
      }
    };

    // Read the file based on type
    if (
      file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.name.endsWith('.xlsx')
    ) {
      reader.readAsBinaryString(file);
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    }
  });
};
