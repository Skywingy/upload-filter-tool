import React, { useState, useEffect } from 'react';
import DataGrid from 'react-data-grid';
import 'react-data-grid/lib/styles.css';

const Grid = ({ data }: { data: any[] }) => {
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  if (!data || data.length === 0) {
    return <div>No data to display</div>;
  }

  const columns = Object.keys(data[0]).map((key) => ({
    key,
    name: key.charAt(0).toUpperCase() + key.slice(1), 
  }));

  useEffect(() => {
    if (columns.length > 0 && visibleColumns.length === 0) {
      setVisibleColumns(columns.map((col) => col.key));
    }
  }, [columns, visibleColumns]);

  const handleCheckboxChange = (columnKey: string) => {
    setVisibleColumns((prevVisibleColumns) =>
      prevVisibleColumns.includes(columnKey)
        ? prevVisibleColumns.filter((col) => col !== columnKey) 
        : [...prevVisibleColumns, columnKey]
    );
  };
  const filteredColumns = columns.filter((col) => visibleColumns.includes(col.key));

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap' }}>
        {columns.map((col) => (
          <div key={col.key} style={{ marginRight: '10px', marginBottom: '10px' }}>
            <label>
              <input
                type="checkbox"
                value={col.key}
                checked={visibleColumns.includes(col.key)}
                onChange={() => handleCheckboxChange(col.key)}
              />
              {col.name}
            </label>
          </div>
        ))}
      </div>

      {/* Render the data grid */}
      <DataGrid
        columns={filteredColumns}
        rows={data}
        style={{ height: '80%' }}
      />
    </div>
  );
};

export default Grid;