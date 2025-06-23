import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [profileUrl, setProfileUrl] = useState('');
  const [profileUrls, setProfileUrls] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('single'); // 'single' or 'batch'

  const API_BASE = 'http://localhost:5000/api';

  const handleSingleProfile = async () => {
    if (!profileUrl.trim()) {
      alert('Please enter a LinkedIn profile URL');
      return;
    }

    setLoading(true);
    try {
      // First scrape the profile
      const scrapeResponse = await axios.post(`${API_BASE}/scrape`, {
        linkedinUrl: profileUrl
      });

      if (scrapeResponse.data.success) {
        // Then generate emails
        const emailResponse = await axios.post(`${API_BASE}/generate-emails`, {
          profile: scrapeResponse.data.data
        });

        setResults([{
          profile: scrapeResponse.data.data,
          emailPatterns: emailResponse.data.emailPatterns || [],
          aiEmail: emailResponse.data.aiEmail || 'AI email generation not available'
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing profile. Check console for details.');
    }
    setLoading(false);
  };

  const handleBatchProcess = async () => {
    const urls = profileUrls.split('\n').filter(url => url.trim());
    if (urls.length === 0) {
      alert('Please enter LinkedIn profile URLs (one per line)');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/batch-process`, {
        profileUrls: urls
      });

      if (response.data.success) {
        setResults(response.data.results);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing profiles. Check console for details.');
    }
    setLoading(false);
  };

  const exportToCSV = () => {
    if (!results) return;

    const csvData = results.map(result => ({
      Name: result.profile.name,
      Title: result.profile.title,
      Company: result.profile.company,
      'Email Pattern 1': result.emailPatterns[0] || '',
      'Email Pattern 2': result.emailPatterns[1] || '',
      'Email Pattern 3': result.emailPatterns[2] || '',
      'AI Email': result.aiEmail?.replace(/\n/g, ' ') || ''
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead-gen-results.csv';
    a.click();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 AI Lead Gen Agent</h1>
        <p>LinkedIn Profile Scraper + Email Generator</p>
      </header>

      <div className="container">
        <div className="mode-selector">
          <button 
            className={mode === 'single' ? 'active' : ''}
            onClick={() => setMode('single')}
          >
            Single Profile
          </button>
          <button 
            className={mode === 'batch' ? 'active' : ''}
            onClick={() => setMode('batch')}
          >
            Batch Process
          </button>
        </div>

        {mode === 'single' ? (
          <div className="input-section">
            <h3>Enter LinkedIn Profile URL:</h3>
            <input
              type="text"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="url-input"
            />
            <button 
              onClick={handleSingleProfile}
              disabled={loading}
              className="process-btn"
            >
              {loading ? 'Processing...' : 'Generate Leads'}
            </button>
          </div>
        ) : (
          <div className="input-section">
            <h3>Enter LinkedIn Profile URLs (one per line):</h3>
            <textarea
              value={profileUrls}
              onChange={(e) => setProfileUrls(e.target.value)}
              placeholder="https://linkedin.com/in/username1&#10;https://linkedin.com/in/username2&#10;https://linkedin.com/in/username3"
              className="urls-textarea"
              rows="5"
            />
            <button 
              onClick={handleBatchProcess}
              disabled={loading}
              className="process-btn"
            >
              {loading ? 'Processing...' : 'Batch Process'}
            </button>
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Scraping profiles and generating emails...</p>
          </div>
        )}

        {results && (
          <div className="results-section">
            <div className="results-header">
              <h3>Results ({results.length} profiles)</h3>
              <button onClick={exportToCSV} className="export-btn">
                Export to CSV
              </button>
            </div>

            {results.map((result, index) => (
              <div key={index} className="result-card">
                <div className="profile-info">
                  <h4>{result.profile.name}</h4>
                  <p><strong>Title:</strong> {result.profile.title}</p>
                  <p><strong>Company:</strong> {result.profile.company}</p>
                </div>

                <div className="email-patterns">
                  <h5>Potential Email Addresses:</h5>
                  <ul>
                    {result.emailPatterns.map((email, idx) => (
                      <li key={idx}>{email}</li>
                    ))}
                  </ul>
                </div>

                <div className="ai-email">
                  <h5>AI Generated Email:</h5>
                  <div className="email-content">
                    <pre>{result.aiEmail}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;