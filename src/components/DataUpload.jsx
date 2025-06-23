import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';

const DataUpload = ({ onDataUpload }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          const data = results.data.filter(row => 
            Object.values(row).some(value => value && value.trim() !== '')
          );
          onDataUpload(data);
        },
        header: true,
        skipEmptyLines: true
      });
    }
  }, [onDataUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  });

  return (
    <div className="upload-container">
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        <div className="upload-content">
          <div className="upload-icon">📊</div>
          <h3>Upload Your Contact Database</h3>
          <p>Drag & drop your CSV/Excel file here, or click to browse</p>
          <div className="upload-formats">
            Supported: CSV, XLS, XLSX
          </div>
        </div>
      </div>
      
      <div className="upload-requirements">
        <h4>Required Columns:</h4>
        <ul>
          <li>✅ Name (or "Full Name")</li>
          <li>✅ Email</li>
          <li>✅ Company</li>
          <li>🔹 Title/Position (optional)</li>
          <li>🔹 Industry (optional)</li>
        </ul>
      </div>
    </div>
  );
};

export default DataUpload;
