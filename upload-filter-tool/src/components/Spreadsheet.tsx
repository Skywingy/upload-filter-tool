import React, { useState } from 'react';
import Handsontable from 'handsontable';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.min.css';
import { registerAllModules } from 'handsontable/registry';

registerAllModules();


const Spreadsheet = ({ data }) => {
  console.log('here', data)
  return (
    <HotTable
      data={data}
      colHeaders={true}
      rowHeaders={true}
      licenseKey="non-commercial-and-evaluation" // Required for Handsontable
      width='auto'
      height='auto'
      className='test'
    />
  );
};

export default Spreadsheet;
