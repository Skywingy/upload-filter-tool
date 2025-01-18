import { useState } from 'react';
import './App.css';
import * as XLSX from 'xlsx'; // Import the xlsx library
import Spreadsheet from './Spreadsheet'; // Import the Spreadsheet component
import Grid from './Grid';
import { processFiles } from '../utility/fileprocessor'; 

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [fileData, setFileData] = useState<any[]>([]); // To store parsed data from files
  const [isFileProcessed, setIsFileProcessed] = useState<boolean>(false); // Track file processing status

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles(droppedFiles);

    // Use the utility to process files
    processFiles(droppedFiles, (data) => {
      setFileData(data);
      setIsFileProcessed(true);
    });
  };
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Required to allow the drop event
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
