import React from 'react';
import { saveAs } from 'file-saver';

const ResultsDisplay = ({ results }) => {
  const downloadCSV = () => {
    const csvContent = results.processedContacts.map(contact => 
      `${contact.name},${contact.email},${contact.company},"${contact.emailSubject}","${contact.emailBody}"`
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'ai-generated-emails.csv');
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h3>✅ AI Processing Complete!</h3>
        <p>Generated {results.processedContacts?.length || 0} personalized email campaigns</p>
      </div>
      
      <div className="results-stats">
        <div className="stat">
          <span className="stat-number">{results.processedContacts?.length || 0}</span>
          <span className="stat-label">Contacts Processed</span>
        </div>
        <div className="stat">
          <span className="stat-number">{(results.processedContacts?.length || 0) * 3}</span>
          <span className="stat-label">Email Variants</span>
        </div>
        <div className="stat">
          <span className="stat-number">AI</span>
          <span className="stat-label">Personalized</span>
        </div>
      </div>
      
      <div className="email-preview">
        <h4>📧 Sample Generated Email:</h4>
        {results.processedContacts && results.processedContacts[0] && (
          <div className="email-sample">
            <div className="email-subject">
              <strong>Subject:</strong> {results.processedContacts[0].emailSubject}
            </div>
            <div className="email-body">
              {results.processedContacts[0].emailBody}
            </div>
          </div>
        )}
      </div>
      
      <div className="download-section">
        <button className="download-btn" onClick={downloadCSV}>
          📥 Download All Emails (CSV)
        </button>
        <button className="download-btn secondary" onClick={() => window.location.reload()}>
          🔄 Process More Contacts
        </button>
      </div>
    </div>
  );
};

export default ResultsDisplay;