import { useState } from 'react';
import './App.css';
import * as XLSX from 'xlsx'; // Import the xlsx library
import Spreadsheet from './Spreadsheet'; // Import the Spreadsheet component

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [fileData, setFileData] = useState<any[]>([]); // To store parsed data from files
  const [isFileProcessed, setIsFileProcessed] = useState<boolean>(false); // Track file processing status

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
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
        if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx')) {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0]; // Read the first sheet
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet); // Convert sheet data to JSON
          setFileData(jsonData); // Set the parsed data
          setIsFileProcessed(true); // Indicate that the file has been processed
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
      
      {/* Display the list of uploaded files */}
      {/* {files.length > 0 && (
        <div className="fileTitle">
          <h2>Uploaded Files:</h2>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </li>
            ))}
          </ul>
        </div>
      )} */}

      {/* Only display the spreadsheet once the file has been processed */}
      {isFileProcessed && fileData.length > 0 && (
        <div className='spreadsheetH1'>
          <h2>Төлбөрийн баримт:</h2>
          <Spreadsheet data={fileData} />
        </div>
      )}
    </div>
  );
}

export default App;
