import React from 'react';
import DataGrid from 'react-data-grid';
import 'react-data-grid/lib/styles.css';

const Grid = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) {
    return <div>No data to display</div>;
  }

  // Extract columns from the keys of the first row of data
  const columns = Object.keys(data[0]).map((key) => ({
    key,
    name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize column names
  }));

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <DataGrid
        columns={columns}
        rows={data}
        style={{ height: '100%' }}
      />
    </div>
  );
};

export default Grid;
