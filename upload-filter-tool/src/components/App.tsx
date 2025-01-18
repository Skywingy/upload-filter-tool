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
          // Use the utility to process files
          //asd
    processFiles(droppedFiles, (data) => {
      setFileData1(data);
      setIsFile1Processed(true);
    });
    }
    else if (dropZone == 2) {
      setFiles2(droppedFiles);
          // Use the utility to process files
    processFiles(droppedFiles, (data) => {
      setFileData2(data);
      setIsFile2Processed(true);
    });
    }


  };
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Required to allow the drop event
  };

  return (
    <div className="body">
      <div className="grid">
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
              <Grid data={fileData1} />
            </div>
          )}
        </div>
      </div>
      <div className="grid">
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
              <Grid data={fileData2} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
