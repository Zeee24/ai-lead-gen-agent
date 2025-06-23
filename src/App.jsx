import React, { useState } from 'react';
import './App.css';
import DataUpload from './components/DataUpload';
import ProcessingStatus from './components/ProcessingStatus';
import ResultsDisplay from './components/ResultsDisplay';

function App() {
  const [uploadedData, setUploadedData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const handleDataUpload = (data) => {
    setUploadedData(data);
  };

  const handleProcessing = (processingState) => {
    setProcessing(processingState);
  };

  const handleResults = (resultsData) => {
    setResults(resultsData);
    setProcessing(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 AI Lead Processor</h1>
        <p>Transform your contact database into personalized email campaigns</p>
      </header>
      
      <main className="App-main">
        {!uploadedData && (
          <DataUpload onDataUpload={handleDataUpload} />
        )}
        
        {uploadedData && !processing && !results && (
          <div className="data-preview">
            <h3>Data Preview ({uploadedData.length} contacts)</h3>
            <div className="preview-table">
              {uploadedData.slice(0, 3).map((contact, index) => (
                <div key={index} className="preview-row">
                  <span>{contact.name || contact.Name}</span>
                  <span>{contact.email || contact.Email}</span>
                  <span>{contact.company || contact.Company}</span>
                </div>
              ))}
            </div>
            <button 
              className="process-btn"
              onClick={() => processContacts(uploadedData, handleProcessing, handleResults)}
            >
              🤖 Generate AI Emails
            </button>
          </div>
        )}
        
        {processing && <ProcessingStatus />}
        {results && <ResultsDisplay results={results} />}
      </main>
    </div>
  );
}

// Process contacts function
async function processContacts(data, onProcessing, onResults) {
  onProcessing(true);
  
  try {
    const response = await fetch('/api/process-contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contacts: data })
    });
    
    const results = await response.json();
    onResults(results);
  } catch (error) {
    console.error('Processing error:', error);
    onProcessing(false);
  }
}

export default App;
