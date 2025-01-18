import { useState } from 'react';
import './App.css';
import * as XLSX from 'xlsx'; // Import the xlsx library
import Spreadsheet from './Spreadsheet'; // Import the Spreadsheet component
import Grid from './Grid';
import { processFiles } from '../utility/fileprocessor'; 

function App() {
  const [files1, setFiles1] = useState<File[]>([]);
  const [files2, setFiles2] = useState<File[]>([]);
  const [fileData1, setFileData1] = useState<any[]>([]); // To store parsed data from files
  const [fileData2, setFileData2] = useState<any[]>([]);
  const [isFile1Processed, setIsFile1Processed] = useState<boolean>(false); // Track file processing status
  const [isFile2Processed, setIsFile2Processed] = useState<boolean>(false);
  const handleDrop = (event: React.DragEvent<HTMLDivElement>, dropZone: number) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);


    if (dropZone == 1) {
      setFiles1(droppedFiles);
      readFiles(droppedFiles, setFileData1, setIsFile1Processed);
    }
    else if (dropZone == 2) {
      setFiles2(droppedFiles);
      readFiles(droppedFiles, setFileData2, setIsFile2Processed);
    }

    // Use the utility to process files
    processFiles(droppedFiles, (data) => {
      setFileData(data);
      setIsFileProcessed(true);
    });
  };
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Required to allow the drop event
  };

  const readFiles = (files: File[], setFileData: React.Dispatch<React.SetStateAction<any[]>>, setIsProcessed: React.Dispatch<React.SetStateAction<boolean>>) => {
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
          setIsProcessed(true); // Indicate that the file has been processed
        }
      };
      reader.readAsBinaryString(file);
    });
  };

  return (
    <div className="body">
      <div className="grid">
        {/* First Drop Zone */}
        <div className="dropZoneContainer">
          {!isFile1Processed && (
            <div>
              <h1>FILE1</h1>
              <div
                className="dropZone"
                onDrop={(e) => handleDrop(e, 1)}
                onDragOver={handleDragOver}
              >
                <p>Файл аа хийнэ үү</p>
              </div>
            </div>
          )}
          {isFile1Processed && fileData1.length > 0 && (
            <div className="spreadsheetH1">
              <h2>file1:</h2>
              <Spreadsheet data={fileData1} />
            </div>
          )}
        </div>
      </div>
      <div className="grid">
        {/* Second Drop Zone */}
        <div className="dropZoneContainer">
          {!isFile2Processed && (
            <div>
              <h1>FILE2</h1>
              <div
                className="dropZone"
                onDrop={(e) => handleDrop(e, 2)}
                onDragOver={handleDragOver}
              >
                <p>Файл аа хийнэ үү</p>
              </div>
            </div>
          )}
          {isFile2Processed && fileData2.length > 0 && (
            <div className="spreadsheetH1">
              <h2>file2:</h2>
              <Spreadsheet data={fileData2} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
