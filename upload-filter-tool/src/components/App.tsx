import { useState } from 'react';
import './App.css';

function App() {
  const [files, setFiles] = useState<File[]>([]);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles(droppedFiles);
    console.log('Dropped files:', droppedFiles);
  };

  const logClick = () => {
    console.log('yes')
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Required to allow the drop event
  };

  return (
    <div>
      <h1>Drag and Drop File Upload</h1>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={logClick}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          marginTop: '20px',
        }}
      >
        <p>Файл аа хийнэ үү</p>
      </div>
      {files.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>Uploaded Files:</h2>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
