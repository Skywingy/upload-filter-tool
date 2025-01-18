import { useState } from 'react';
import './App.css';
import * as XLSX from 'xlsx'; // Import the xlsx library
import Spreadsheet from './Spreadsheet'; // Import the Spreadsheet component
import Grid from './Grid';

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [fileData, setFileData] = useState<any[]>([]); // To store parsed data from files
  const [isFileProcessed, setIsFileProcessed] = useState<boolean>(false); // Track file processing status

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    console.log('h')
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles(droppedFiles);
    readFiles(droppedFiles); // Read and process the files
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Required to allow the drop event
  };

  const readFiles = (files: File[]) => {
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        if (
          file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.name.endsWith('.xlsx')
        ) {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0]; // Get the first sheet name
          const sheet = workbook.Sheets[sheetName];
  
          // Read data including blank columns
          const jsonData = XLSX.utils.sheet_to_json(sheet, {
            header: 1, // Read as a 2D array to get all rows/columns
            defval: '', // Assign a default value to blank cells
          });
  
          // Convert the 2D array to an object structure (optional)
          const headers = jsonData[0]; // Assume first row is the header
          const rows = jsonData.slice(1); // Data starts from the second row
  
          const formattedData = rows.map((row) =>
            headers.reduce(
              (acc, header, index) => ({
                ...acc,
                [header]: row[index] || '', // Map headers to row values
              }),
              {}
            )
          );
  
          setFileData(formattedData); // Set the parsed data
          setIsFileProcessed(true);
        }
      };
      reader.readAsBinaryString(file);
    });
  };
  return (
    <div className='body'>
      {!isFileProcessed && (
        <div>
          <h1>Drag and Drop File Upload</h1>
            <div
              className="dropZone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <p>Файл аа хийнэ үү</p>
            </div>
        </div>
      )}
      {isFileProcessed && fileData.length > 0 && (
        <div className='spreadsheetH1'>
          <h2>Төлбөрийн баримт:</h2>
          <Grid data={fileData} />
        </div>
      )}
    </div>
  );
}

export default App;
